/**
 * ============================================
 *  Study Plan Controller
 * ============================================
 *  CRUD operations for study plans.
 *  The create endpoint integrates with the AI service
 *  to generate a personalized schedule.
 */

const StudyPlan = require('../models/StudyPlan');
const DailyTask = require('../models/DailyTask');
const { generateStudyPlan } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * POST /api/plans
 * Create a new AI-generated study plan.
 */
const createPlan = asyncHandler(async (req, res) => {
  const {
    goal,
    deadline,
    dailyHours,
    currentLevel,
    topics,
    weakAreas,
    preferredStudyTime,
    breakPreference,
  } = req.body;

  // 1) Generate the schedule using AI
  const aiSchedule = await generateStudyPlan({
    goal,
    deadline,
    dailyHours,
    currentLevel,
    topics,
    weakAreas,
    preferredStudyTime,
    breakPreference,
  });

  // 2) Create the study plan document
  const plan = await StudyPlan.create({
    userId: req.user._id,
    goal,
    deadline,
    dailyHours,
    currentLevel,
    topics,
    weakAreas: weakAreas || [],
    preferredStudyTime: preferredStudyTime || 'morning',
    breakPreference: breakPreference || 'pomodoro',
    generatedSchedule: aiSchedule,
    status: 'active',
  });

  // 3) Create DailyTask documents from the AI schedule
  if (aiSchedule.schedule && Array.isArray(aiSchedule.schedule)) {
    const dailyTaskDocs = aiSchedule.schedule.map((day) => ({
      planId: plan._id,
      date: new Date(day.date),
      tasks: (day.tasks || []).map((task, index) => ({
        title: task.title,
        description: task.description || '',
        duration: task.duration || 30,
        topic: task.topic || '',
        type: task.type || 'study',
        completed: false,
        order: task.order || index + 1,
      })),
      completed: false,
      timeSpent: 0,
    }));

    // Bulk insert for performance
    await DailyTask.insertMany(dailyTaskDocs, { ordered: false }).catch((err) => {
      console.warn('⚠️  Some daily tasks could not be created:', err.message);
    });
  }

  res.status(201).json({
    success: true,
    message: 'Study plan created successfully',
    data: plan,
  });
});

/**
 * GET /api/plans
 * Get all study plans for the authenticated user.
 */
const getPlans = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { userId: req.user._id };
  if (status) filter.status = status;

  const plans = await StudyPlan.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-generatedSchedule'); // Exclude heavy schedule data in list view

  const total = await StudyPlan.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: plans,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/plans/:id
 * Get a single study plan (with full schedule).
 */
const getPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({
    _id: req.params.id,
    userId: req.user._id, // Ensures user can only access own plans
  });

  if (!plan) {
    throw new AppError('Study plan not found', 404);
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

/**
 * PUT /api/plans/:id
 * Update an existing study plan.
 */
const updatePlan = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'goal',
    'deadline',
    'dailyHours',
    'status',
    'progress',
    'preferredStudyTime',
    'breakPreference',
  ];

  const updates = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const plan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!plan) {
    throw new AppError('Study plan not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Study plan updated successfully',
    data: plan,
  });
});

/**
 * DELETE /api/plans/:id
 * Delete a study plan and all associated daily tasks.
 */
const deletePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!plan) {
    throw new AppError('Study plan not found', 404);
  }

  // Cascade: remove all daily tasks for this plan
  await DailyTask.deleteMany({ planId: plan._id });

  res.status(200).json({
    success: true,
    message: 'Study plan and associated tasks deleted',
  });
});

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
};
