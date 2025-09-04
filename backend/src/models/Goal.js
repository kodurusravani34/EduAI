const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'language', 'mathematics', 'science', 'business', 'creative', 'other']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused', 'cancelled'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    order: { type: Number, required: true }
  }],
  metrics: {
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    lessonsRequired: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 }
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  aiSuggestions: [{
    type: { type: String, enum: ['resource', 'milestone', 'study_plan'] },
    content: String,
    confidence: Number,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });
goalSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Goal', goalSchema);
