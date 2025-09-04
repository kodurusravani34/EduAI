const express = require('express');
const auth = require('../middleware/auth');
const Lesson = require('../models/Lesson');

const router = express.Router();

// Get all lessons for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, goalId, category, sort = 'createdAt', limit = 50 } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter['progress.status'] = status;
    if (goalId) filter.goalId = goalId;
    if (category) filter.category = category;

    const lessons = await Lesson.find(filter)
      .populate('goalId', 'title category')
      .sort({ [sort]: -1 })
      .limit(parseInt(limit));

    res.json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Create new lesson
router.post('/', auth, async (req, res) => {
  try {
    const lessonData = {
      ...req.body,
      userId: req.user._id
    };

    const lesson = new Lesson(lessonData);
    await lesson.save();

    await lesson.populate('goalId', 'title category');
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(400).json({ error: 'Failed to create lesson' });
  }
});

// Get single lesson
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('goalId', 'title category');

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Update last accessed time
    lesson.progress.lastAccessedAt = new Date();
    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Update lesson
router.put('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('goalId', 'title category');

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(400).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson
router.delete('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Start lesson (update progress)
router.patch('/:id/start', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lesson.progress.status = 'in_progress';
    lesson.progress.startedAt = lesson.progress.startedAt || new Date();
    lesson.progress.lastAccessedAt = new Date();

    await lesson.save();
    await lesson.populate('goalId', 'title category');

    res.json(lesson);
  } catch (error) {
    console.error('Start lesson error:', error);
    res.status(400).json({ error: 'Failed to start lesson' });
  }
});

// Complete lesson
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { timeSpent, rating } = req.body;

    const lesson = await Lesson.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lesson.progress.status = 'completed';
    lesson.progress.completedAt = new Date();
    lesson.progress.completionPercentage = 100;
    lesson.progress.lastAccessedAt = new Date();

    if (timeSpent) {
      lesson.progress.timeSpent = (lesson.progress.timeSpent || 0) + timeSpent;
    }

    if (rating) {
      lesson.rating.userRating = rating;
    }

    await lesson.save();

    // Update user stats
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.totalLessonsCompleted': 1,
        'stats.totalTimeSpent': timeSpent || 0
      }
    });

    await lesson.populate('goalId', 'title category');
    res.json(lesson);
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(400).json({ error: 'Failed to complete lesson' });
  }
});

// Update lesson progress (for tracking time spent)
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { completionPercentage, timeSpent } = req.body;

    const lesson = await Lesson.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (completionPercentage !== undefined) {
      lesson.progress.completionPercentage = Math.max(0, Math.min(100, completionPercentage));
    }

    if (timeSpent) {
      lesson.progress.timeSpent = (lesson.progress.timeSpent || 0) + timeSpent;
    }

    lesson.progress.lastAccessedAt = new Date();

    // Update status based on completion percentage
    if (lesson.progress.completionPercentage === 100 && lesson.progress.status !== 'completed') {
      lesson.progress.status = 'completed';
      lesson.progress.completedAt = new Date();
      
      // Update user stats
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'stats.totalLessonsCompleted': 1,
          'stats.totalTimeSpent': timeSpent || 0
        }
      });
    } else if (lesson.progress.completionPercentage > 0 && lesson.progress.status === 'not_started') {
      lesson.progress.status = 'in_progress';
      lesson.progress.startedAt = lesson.progress.startedAt || new Date();
    }

    await lesson.save();
    await lesson.populate('goalId', 'title category');

    res.json(lesson);
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(400).json({ error: 'Failed to update lesson progress' });
  }
});

// Get lesson recommendations
router.get('/recommendations/ai', auth, async (req, res) => {
  try {
    const { goalId, category, limit = 5 } = req.query;

    // Get user's completed lessons
    const completedLessons = await Lesson.find({
      userId: req.user._id,
      'progress.status': 'completed'
    }).limit(10);

    // Get user's current goals
    const Goal = require('../models/Goal');
    const currentGoals = await Goal.find({
      userId: req.user._id,
      status: { $in: ['not_started', 'in_progress'] }
    });

    // For now, return some basic recommendations
    // In a full implementation, this would use the AI service
    const recommendations = [
      {
        title: 'Introduction to React Hooks',
        description: 'Learn the fundamentals of React Hooks',
        type: 'video',
        estimatedDuration: 30,
        difficulty: 'intermediate',
        category: 'programming',
        source: { platform: 'youtube' }
      },
      {
        title: 'JavaScript ES6 Features',
        description: 'Master modern JavaScript syntax',
        type: 'video',
        estimatedDuration: 45,
        difficulty: 'beginner',
        category: 'programming',
        source: { platform: 'youtube' }
      },
      {
        title: 'CSS Grid Layout',
        description: 'Build responsive layouts with CSS Grid',
        type: 'video',
        estimatedDuration: 25,
        difficulty: 'intermediate',
        category: 'programming',
        source: { platform: 'youtube' }
      }
    ].slice(0, parseInt(limit));

    res.json(recommendations);
  } catch (error) {
    console.error('Lesson recommendations error:', error);
    res.status(500).json({ error: 'Failed to get lesson recommendations' });
  }
});

module.exports = router;
