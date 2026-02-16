/**
 * ============================================
 *  Daily Task Model
 * ============================================
 *  Represents a single day's set of tasks within
 *  a study plan. Tracks completion and time spent.
 */

const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: Number, // Expected duration in minutes
      default: 30,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['study', 'review', 'practice', 'quiz', 'break'],
      default: 'study',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const dailyTaskSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyPlan',
      required: [true, 'Plan ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    tasks: {
      type: [taskItemSchema],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // Total minutes spent
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index – fast lookup for a specific day of a plan
dailyTaskSchema.index({ planId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
