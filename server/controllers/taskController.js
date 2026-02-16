/**
 * ============================================
 *  Daily Task Controller
 * ============================================
 *  Handles retrieval and updates for daily tasks
 *  within a study plan. Includes progress recalculation.
 */

const DailyTask = require('../models/DailyTask');
const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * GET /api/tasks/:planId/:date
 * Returns the tasks for a specific day of a plan.
 * Date format: YYYY-MM-DD
 */
const getTasksByDate = asyncHandler(async (req, res) => {
  const { planId, date } = req.params;

  // Verify the plan belongs to the authenticated user
  const plan = await StudyPlan.findOne({
    _id: planId,
    userId: req.user._id,
  });

  if (!plan) {
    throw new AppError('Study plan not found', 404);
  }

  // Parse date to match stored date (start of day UTC)
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const dailyTask = await DailyTask.findOne({
    planId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!dailyTask) {
    // Return an empty task set instead of 404
    return res.status(200).json({
      success: true,
      data: {
        planId,
        date,
        tasks: [],
        completed: false,
        timeSpent: 0,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: dailyTask,
  });
});

/**
 * PUT /api/tasks/:taskId
 * Update a daily task – mark tasks complete, update time spent.
 *
 * Body can include:
 *   - completed (boolean): mark entire day as done
 *   - timeSpent (number): total minutes spent
 *   - taskUpdates (array): [{ _id, completed }] to toggle individual tasks
 */
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { completed, timeSpent, taskUpdates } = req.body;

  // Find the daily task document
  const dailyTask = await DailyTask.findById(taskId);

  if (!dailyTask) {
    throw new AppError('Daily task not found', 404);
  }

  // Verify the parent plan belongs to the user
  const plan = await StudyPlan.findOne({
    _id: dailyTask.planId,
    userId: req.user._id,
  });

  if (!plan) {
    throw new AppError('Unauthorized access to this task', 403);
  }

  // Update individual sub-tasks if provided
  if (taskUpdates && Array.isArray(taskUpdates)) {
    for (const update of taskUpdates) {
      const subTask = dailyTask.tasks.id(update._id);
      if (subTask) {
        if (update.completed !== undefined) subTask.completed = update.completed;
      }
    }
  }

  // Update top-level fields
  if (completed !== undefined) dailyTask.completed = completed;
  if (timeSpent !== undefined) dailyTask.timeSpent = timeSpent;

  // Auto-detect: if all sub-tasks are completed, mark the day as completed
  if (dailyTask.tasks.length > 0) {
    const allDone = dailyTask.tasks.every((t) => t.completed);
    dailyTask.completed = allDone;
  }

  await dailyTask.save();

  // --- Recalculate overall plan progress ---
  const totalDays = await DailyTask.countDocuments({ planId: plan._id });
  const completedDays = await DailyTask.countDocuments({
    planId: plan._id,
    completed: true,
  });

  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  await StudyPlan.findByIdAndUpdate(plan._id, { progress });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: {
      dailyTask,
      planProgress: progress,
    },
  });
});

module.exports = {
  getTasksByDate,
  updateTask,
};
