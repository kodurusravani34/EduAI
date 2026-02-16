/**
 * ============================================
 *  Study Plan Model
 * ============================================
 *  Represents an AI-generated study plan for a user.
 *  The `generatedSchedule` field stores the full
 *  JSON schedule returned by the LLM.
 */

const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    goal: {
      type: String,
      required: [true, 'Study goal is required'],
      trim: true,
      maxlength: [500, 'Goal cannot exceed 500 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    dailyHours: {
      type: Number,
      required: [true, 'Daily study hours required'],
      min: [0.5, 'Minimum 0.5 hours per day'],
      max: [16, 'Maximum 16 hours per day'],
    },
    currentLevel: {
      type: String,
      required: [true, 'Current knowledge level is required'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Level must be beginner, intermediate, or advanced',
      },
    },
    topics: {
      type: [String],
      required: [true, 'At least one topic is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Topics array cannot be empty',
      },
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning',
    },
    breakPreference: {
      type: String,
      enum: ['pomodoro', 'long-blocks', 'flexible'],
      default: 'pomodoro',
    },
    generatedSchedule: {
      type: mongoose.Schema.Types.Mixed, // Full JSON schedule from AI
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual – daily tasks belonging to this plan
studyPlanSchema.virtual('dailyTasks', {
  ref: 'DailyTask',
  localField: '_id',
  foreignField: 'planId',
});

// Compound index for efficient user-specific queries
studyPlanSchema.index({ userId: 1, status: 1 });
studyPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
