const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Lesson = require('../models/Lesson');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'profile.firstName', 'profile.lastName', 'profile.bio', 
      'profile.learningPreferences', 'profile.skillLevel',
      'preferences.dailyGoal', 'preferences.notifications', 'preferences.theme'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) || key.startsWith('profile.') || key.startsWith('preferences.')) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user goals
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).limit(5);

    // Get recent lessons
    const recentLessons = await Lesson.find({ userId })
      .sort({ 'progress.lastAccessedAt': -1 })
      .limit(10)
      .populate('goalId', 'title');

    // Get completed lessons this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyLessons = await Lesson.find({
      userId,
      'progress.completedAt': { $gte: oneWeekAgo },
      'progress.status': 'completed'
    });

    // Calculate stats
    const totalTimeThisWeek = weeklyLessons.reduce((total, lesson) => 
      total + (lesson.progress.timeSpent || 0), 0);

    const streakData = await calculateStreak(userId);
    
    // Update user stats
    await User.findByIdAndUpdate(userId, {
      'stats.currentStreak': streakData.currentStreak,
      'stats.longestStreak': Math.max(req.user.stats.longestStreak, streakData.currentStreak)
    });

    res.json({
      goals: goals.length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      inProgressGoals: goals.filter(g => g.status === 'in_progress').length,
      totalLessons: await Lesson.countDocuments({ userId }),
      completedLessons: await Lesson.countDocuments({ 
        userId, 
        'progress.status': 'completed' 
      }),
      totalTimeSpent: req.user.stats.totalTimeSpent,
      timeThisWeek: totalTimeThisWeek,
      currentStreak: streakData.currentStreak,
      recentLessons,
      goals
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Get user learning analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7d' } = req.query;

    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get lessons in period
    const lessons = await Lesson.find({
      userId,
      'progress.completedAt': { $gte: startDate }
    }).populate('goalId', 'title category');

    // Daily progress
    const dailyProgress = {};
    lessons.forEach(lesson => {
      if (lesson.progress.completedAt) {
        const date = lesson.progress.completedAt.toISOString().split('T')[0];
        if (!dailyProgress[date]) {
          dailyProgress[date] = { lessons: 0, timeSpent: 0 };
        }
        dailyProgress[date].lessons++;
        dailyProgress[date].timeSpent += lesson.progress.timeSpent || 0;
      }
    });

    // Category breakdown
    const categoryBreakdown = {};
    lessons.forEach(lesson => {
      const category = lesson.goalId?.category || 'other';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { lessons: 0, timeSpent: 0 };
      }
      categoryBreakdown[category].lessons++;
      categoryBreakdown[category].timeSpent += lesson.progress.timeSpent || 0;
    });

    // Weekly comparison
    const previousWeekStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekLessons = await Lesson.find({
      userId,
      'progress.completedAt': { 
        $gte: previousWeekStart, 
        $lt: startDate 
      }
    });

    res.json({
      period,
      totalLessons: lessons.length,
      totalTime: lessons.reduce((sum, l) => sum + (l.progress.timeSpent || 0), 0),
      dailyProgress,
      categoryBreakdown,
      comparison: {
        previousPeriodLessons: previousWeekLessons.length,
        previousPeriodTime: previousWeekLessons.reduce((sum, l) => sum + (l.progress.timeSpent || 0), 0)
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Helper function to calculate streak
async function calculateStreak(userId) {
  const lessons = await Lesson.find({
    userId,
    'progress.status': 'completed',
    'progress.completedAt': { $exists: true }
  }).sort({ 'progress.completedAt': -1 });

  if (lessons.length === 0) {
    return { currentStreak: 0 };
  }

  let currentStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < lessons.length; i++) {
    const lessonDate = new Date(lessons[i].progress.completedAt);
    lessonDate.setHours(0, 0, 0, 0);

    const diffTime = currentDate.getTime() - lessonDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === currentStreak || (currentStreak === 0 && diffDays <= 1)) {
      if (diffDays > currentStreak) {
        currentStreak = diffDays;
        currentDate = lessonDate;
      }
    } else if (diffDays === currentStreak + 1) {
      currentStreak++;
      currentDate = lessonDate;
    } else {
      break;
    }
  }

  return { currentStreak };
}

module.exports = router;
