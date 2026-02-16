/**
 * ============================================
 *  Input Validation Middleware
 * ============================================
 *  Uses express-validator to validate request bodies.
 *  Export reusable validation chains for each route.
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Runs after validation chains – returns 400 if there are errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
};

// ─── Study Plan Validation ───────────────────────────────────────
const validateCreatePlan = [
  body('goal')
    .trim()
    .notEmpty()
    .withMessage('Goal is required')
    .isLength({ max: 500 })
    .withMessage('Goal must be under 500 characters'),
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('dailyHours')
    .notEmpty()
    .withMessage('Daily study hours required')
    .isFloat({ min: 0.5, max: 16 })
    .withMessage('Daily hours must be between 0.5 and 16'),
  body('currentLevel')
    .trim()
    .notEmpty()
    .withMessage('Current level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),
  body('topics')
    .isArray({ min: 1 })
    .withMessage('At least one topic is required'),
  body('topics.*')
    .trim()
    .notEmpty()
    .withMessage('Topic cannot be empty'),
  body('weakAreas')
    .optional()
    .isArray()
    .withMessage('Weak areas must be an array'),
  body('preferredStudyTime')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Preferred study time must be morning, afternoon, evening, or night'),
  body('breakPreference')
    .optional()
    .isIn(['pomodoro', 'long-blocks', 'flexible'])
    .withMessage('Break preference must be pomodoro, long-blocks, or flexible'),
  validate,
];

const validateUpdatePlan = [
  param('id').isMongoId().withMessage('Invalid plan ID'),
  body('goal')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Goal must be under 500 characters'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('dailyHours')
    .optional()
    .isFloat({ min: 0.5, max: 16 })
    .withMessage('Daily hours must be between 0.5 and 16'),
  body('status')
    .optional()
    .isIn(['active', 'paused', 'completed', 'archived'])
    .withMessage('Invalid status value'),
  validate,
];

// ─── User Preferences Validation ─────────────────────────────────
const validatePreferences = [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean'),
  body('preferences.dailyGoalHours')
    .optional()
    .isFloat({ min: 0.5, max: 16 })
    .withMessage('Daily goal must be between 0.5 and 16 hours'),
  validate,
];

// ─── Task Validation ─────────────────────────────────────────────
const validateUpdateTask = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('timeSpent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Time spent must be a positive number'),
  validate,
];

const validateGetTasks = [
  param('planId').isMongoId().withMessage('Invalid plan ID'),
  param('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  validate,
];

module.exports = {
  validate,
  validateCreatePlan,
  validateUpdatePlan,
  validatePreferences,
  validateUpdateTask,
  validateGetTasks,
};
