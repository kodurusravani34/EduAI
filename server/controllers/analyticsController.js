/**
 * ============================================
 *  Analytics Controller (Production Ready)
 * ============================================
 * Computes study analytics from the user's plans
 * and daily tasks – completion rates, streaks,
 * weekly study hours, and per-plan progress.
 */

const StudyPlan = require('../models/StudyPlan');
const DailyTask = require('../models/DailyTask');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Format date to YYYY-MM-DD (LOCAL TIME)
 * Prevents timezone bugs (important for India)
 */
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-CA', { timeZone: 'UTC' }); // YYYY-MM-DD consistent with UTC storage

/**
 * GET /api/analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // =====================================================
  // 1) Get user plans
  // =====================================================
  const plans = await StudyPlan.find({ userId }).lean();

  const activePlans = plans.filter((p) => p.status === 'active');
  const planIds = activePlans.map((p) => p._id);

  // =====================================================
  // 2) Get all tasks for active plans
  // =====================================================
  const allTasks = await DailyTask.find({
    planId: { $in: planIds },
  })
    .sort({ date: 1 })
    .lean();

  // =====================================================
  // 3) Basic stats
  // =====================================================
  let totalSubTasks = 0;
  let completedSubTasks = 0;
  let totalTimeSpent = 0;

  const completedDates = new Set();
  const minutesByDate = {};
  const topicCounts = {};

  allTasks.forEach((day) => {
    const dateStr = formatDate(day.date);

    // Time tracking: Fallback to sum of completed tasks if timeSpent is 0
    let minutes = day.timeSpent || 0;

    // Fallback logic for legacy data or un-updated records
    if (minutes === 0) {
      minutes = day.tasks.reduce((sum, t) => sum + (t.completed ? (t.duration || 30) : 0), 0);
    }

    totalTimeSpent += minutes;
    minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + minutes;

    // Task stats
    const hasCompleted = day.tasks.some((t) => t.completed);

    if (hasCompleted) completedDates.add(dateStr);

    day.tasks.forEach((t) => {
      totalSubTasks++;
      if (t.completed) completedSubTasks++;

      if (t.topic) {
        topicCounts[t.topic] = (topicCounts[t.topic] || 0) + 1;
      }
    });
  });

  const completionRate =
    totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0;

  const totalStudyHours = Math.round((totalTimeSpent / 60) * 10) / 10;

  // =====================================================
  // 4) Current streak
  // =====================================================
  // Use UTC to align with formatDate
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let currentStreak = 0;
  let checkDate = new Date(todayUTC);

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(checkDate);

    if (completedDates.has(dateStr)) {
      currentStreak++;
    } else if (i > 0) {
      break; // allow today to be incomplete
    }

    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  // =====================================================
  // 5) Weekly stats (last 7 days)
  // =====================================================
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyStats = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayUTC);
    d.setUTCDate(d.getUTCDate() - i);

    const dateStr = formatDate(d);
    const minutes = minutesByDate[dateStr] || 0;

    weeklyStats.push({
      day: dayNames[d.getUTCDay()],
      date: dateStr,
      hours: Math.round((minutes / 60) * 10) / 10,
    });
  }

  const weeklyActualHours = weeklyStats.reduce(
    (sum, d) => sum + d.hours,
    0
  );

  // Weekly goal should likely be the highest dailyHours of active plans * 7, 
  // or sum of dailyHours * 7. Let's stick to sum but ensure it's calculated on dally basis.
  const weeklyGoalHours = activePlans.reduce(
    (sum, p) => sum + (p.dailyHours || 0) * 7,
    0
  );

  // =====================================================
  // 6) Top subject
  // =====================================================
  const topSubject =
    Object.keys(topicCounts).length > 0
      ? Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  // =====================================================
  // 7) Per-plan progress
  // =====================================================
  const planProgress = plans.map((p) => ({
    _id: p._id,
    goal: p.goal,
    progress: p.progress || 0,
    status: p.status,
    topics: p.topics,
  }));

  // =====================================================
  // 8) Response
  // =====================================================
  res.status(200).json({
    success: true,
    data: {
      totalStudyHours,
      currentStreak,
      tasksCompleted: completedSubTasks,
      totalTasks: totalSubTasks,
      completionRate,

      weeklyGoalHours: Math.round(weeklyGoalHours * 10) / 10,
      weeklyActualHours: Math.round(weeklyActualHours * 10) / 10,

      topSubject,
      weeklyStats,
      planProgress,

      activePlans: activePlans.length,
      totalPlans: plans.length,
    },
  });
});

module.exports = { getAnalytics };
