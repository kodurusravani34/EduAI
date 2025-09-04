const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Lesson = require('../models/Lesson');

const router = express.Router();

// Generate personalized study plan
router.post('/study-plan', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const goals = await Goal.find({ 
      userId: req.user._id, 
      status: { $in: ['not_started', 'in_progress'] } 
    });

    const studyPlan = await aiService.generateStudyPlan(user.profile, goals);
    res.json(studyPlan);
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate study plan',
      message: process.env.NODE_ENV === 'development' ? error.message : 'AI service unavailable'
    });
  }
});

// Get lesson recommendations
router.get('/lesson-recommendations', auth, async (req, res) => {
  try {
    const completedLessons = await Lesson.find({
      userId: req.user._id,
      'progress.status': 'completed'
    }).sort({ 'progress.completedAt': -1 }).limit(10);

    const currentGoals = await Goal.find({
      userId: req.user._id,
      status: { $in: ['not_started', 'in_progress'] }
    });

    const user = await User.findById(req.user._id);
    
    const recommendations = await aiService.recommendNextLessons(
      completedLessons,
      currentGoals,
      user.profile
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Lesson recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to get lesson recommendations',
      message: process.env.NODE_ENV === 'development' ? error.message : 'AI service unavailable'
    });
  }
});

// Analyze learning progress
router.get('/progress-analysis', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const recentLessons = await Lesson.find({
      userId: req.user._id,
      'progress.completedAt': { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }).sort({ 'progress.completedAt': -1 });

    const analysis = await aiService.analyzeLearningProgress(user.stats, recentLessons);
    res.json(analysis);
  } catch (error) {
    console.error('Progress analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze progress',
      message: process.env.NODE_ENV === 'development' ? error.message : 'AI service unavailable'
    });
  }
});

// Generate goal milestones
router.post('/goal-milestones', auth, async (req, res) => {
  try {
    const { title, description, category, difficulty } = req.body;

    if (!title || !category || !difficulty) {
      return res.status(400).json({ 
        error: 'Title, category, and difficulty are required' 
      });
    }

    const milestones = await aiService.suggestGoalMilestones(
      title,
      description || '',
      category,
      difficulty
    );

    res.json(milestones);
  } catch (error) {
    console.error('Milestone generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate milestones',
      message: process.env.NODE_ENV === 'development' ? error.message : 'AI service unavailable'
    });
  }
});

// Get personalized insights
router.get('/insights', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const goals = await Goal.find({ userId: req.user._id });
    const recentLessons = await Lesson.find({
      userId: req.user._id,
      'progress.completedAt': { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    });

    // Generate basic insights without AI (fallback)
    const insights = {
      learningVelocity: calculateLearningVelocity(recentLessons),
      goalProgress: calculateGoalProgress(goals),
      timeDistribution: calculateTimeDistribution(recentLessons),
      recommendations: generateBasicRecommendations(user, goals, recentLessons),
      strengths: identifyStrengths(recentLessons),
      improvements: suggestImprovements(user, recentLessons)
    };

    // Try to enhance with AI analysis
    try {
      const aiAnalysis = await aiService.analyzeLearningProgress(user.stats, recentLessons);
      insights.aiAnalysis = aiAnalysis;
    } catch (aiError) {
      console.log('AI analysis unavailable, using fallback insights');
    }

    res.json(insights);
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Helper functions for fallback insights
function calculateLearningVelocity(lessons) {
  if (lessons.length === 0) return 0;
  
  const totalTime = lessons.reduce((sum, lesson) => sum + (lesson.progress.timeSpent || 0), 0);
  const daysActive = lessons.length > 0 ? 7 : 0; // Last 7 days
  
  return daysActive > 0 ? Math.round(totalTime / daysActive) : 0;
}

function calculateGoalProgress(goals) {
  if (goals.length === 0) return { total: 0, completed: 0, inProgress: 0 };
  
  return {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in_progress').length,
    averageProgress: Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
  };
}

function calculateTimeDistribution(lessons) {
  const distribution = {};
  lessons.forEach(lesson => {
    const category = lesson.category || 'other';
    distribution[category] = (distribution[category] || 0) + (lesson.progress.timeSpent || 0);
  });
  return distribution;
}

function generateBasicRecommendations(user, goals, lessons) {
  const recommendations = [];
  
  if (lessons.length === 0) {
    recommendations.push('Start with your first lesson to begin building momentum');
  } else if (lessons.length < 3) {
    recommendations.push('Try to complete at least one lesson daily for better progress');
  }
  
  const inProgressGoals = goals.filter(g => g.status === 'in_progress');
  if (inProgressGoals.length > 3) {
    recommendations.push('Consider focusing on fewer goals to improve completion rate');
  }
  
  return recommendations;
}

function identifyStrengths(lessons) {
  const strengths = [];
  
  if (lessons.length >= 5) {
    strengths.push('Consistent learning habit');
  }
  
  const avgCompletionTime = lessons.reduce((sum, l) => sum + (l.progress.timeSpent || 0), 0) / lessons.length;
  if (avgCompletionTime >= 20) {
    strengths.push('Deep focus on learning materials');
  }
  
  return strengths;
}

function suggestImprovements(user, lessons) {
  const suggestions = [];
  
  if (lessons.length === 0) {
    suggestions.push('Start your learning journey by completing your first lesson');
  }
  
  const dailyGoal = user.preferences?.dailyGoal || 30;
  const actualDailyAverage = lessons.reduce((sum, l) => sum + (l.progress.timeSpent || 0), 0) / 7;
  
  if (actualDailyAverage < dailyGoal) {
    suggestions.push(`Try to reach your daily goal of ${dailyGoal} minutes`);
  }
  
  return suggestions;
}

module.exports = router;
