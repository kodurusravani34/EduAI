/**
 * ============================================
 *  User Controller
 * ============================================
 *  Handles user profile retrieval and preference updates.
 *  All routes here are protected (user attached by auth middleware).
 */

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * GET /api/users/me
 * Returns the authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('planCount');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * PUT /api/users/preferences
 * Updates the authenticated user's preferences.
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== 'object') {
    throw new AppError('Preferences object is required', 400);
  }

  // Build update object – only allow known preference fields
  const allowedFields = [
    'theme',
    'notifications',
    'dailyGoalHours',
    'preferredStudyTime',
    'breakPreference',
  ];

  const update = {};
  for (const key of allowedFields) {
    if (preferences[key] !== undefined) {
      update[`preferences.${key}`] = preferences[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: user,
  });
});

module.exports = {
  getMe,
  updatePreferences,
};
