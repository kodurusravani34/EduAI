const express = require('express');
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const aiService = require('../services/aiService');

const router = express.Router();

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, sort = 'createdAt' } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (category) filter.category = category;

    const goals = await Goal.find(filter).sort({ [sort]: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create new goal
router.post('/', auth, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      userId: req.user._id
    };

    const goal = new Goal(goalData);
    await goal.save();

    // Generate AI suggestions for milestones if requested
    if (req.body.generateSuggestions) {
      try {
        const suggestions = await aiService.suggestGoalMilestones(
          goal.title,
          goal.description,
          goal.category,
          goal.difficulty
        );
        
        goal.milestones = suggestions.map((suggestion, index) => ({
          ...suggestion,
          order: index + 1,
          completed: false
        }));

        await goal.save();
      } catch (aiError) {
        console.error('AI suggestion error:', aiError);
        // Continue without suggestions if AI fails
      }
    }

    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(400).json({ error: 'Failed to create goal' });
  }
});

// Get single goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(400).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Update goal progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
      },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(400).json({ error: 'Failed to update progress' });
  }
});

// Update milestone
router.patch('/:goalId/milestones/:milestoneIndex', auth, async (req, res) => {
  try {
    const { goalId, milestoneIndex } = req.params;
    const updates = req.body;

    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (milestoneIndex >= goal.milestones.length) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Update milestone
    Object.keys(updates).forEach(key => {
      goal.milestones[milestoneIndex][key] = updates[key];
    });

    if (updates.completed && !goal.milestones[milestoneIndex].completedAt) {
      goal.milestones[milestoneIndex].completedAt = new Date();
    }

    // Recalculate goal progress based on completed milestones
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    goal.progress = Math.round((completedMilestones / goal.milestones.length) * 100);
    goal.status = goal.progress === 100 ? 'completed' : goal.progress > 0 ? 'in_progress' : 'not_started';

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(400).json({ error: 'Failed to update milestone' });
  }
});

// Get goal suggestions based on user profile
router.get('/suggestions/ai', auth, async (req, res) => {
  try {
    const userGoals = await Goal.find({ userId: req.user._id });
    
    // This would typically call the AI service to get personalized suggestions
    // For now, return some predefined suggestions based on user's existing goals
    const suggestions = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Master the basics of JavaScript programming',
        category: 'programming',
        difficulty: 'beginner',
        estimatedHours: 20
      },
      {
        title: 'React Development',
        description: 'Learn to build modern web applications with React',
        category: 'programming',
        difficulty: 'intermediate',
        estimatedHours: 40
      },
      {
        title: 'Data Structures and Algorithms',
        description: 'Understand fundamental computer science concepts',
        category: 'programming',
        difficulty: 'intermediate',
        estimatedHours: 50
      }
    ];

    res.json(suggestions);
  } catch (error) {
    console.error('Goal suggestions error:', error);
    res.status(500).json({ error: 'Failed to get goal suggestions' });
  }
});

module.exports = router;
