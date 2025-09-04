const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['video', 'article', 'exercise', 'quiz', 'project', 'other'],
    required: true
  },
  source: {
    platform: {
      type: String,
      enum: ['youtube', 'custom', 'coursera', 'udemy', 'khan_academy', 'other'],
      default: 'custom'
    },
    url: String,
    videoId: String, // For YouTube videos
    duration: Number, // in seconds
    thumbnail: String
  },
  content: {
    notes: String,
    materials: [String], // URLs or file paths
    exercises: [{
      question: String,
      answer: String,
      type: { type: String, enum: ['multiple_choice', 'text', 'code'] }
    }]
  },
  progress: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped'],
      default: 'not_started'
    },
    timeSpent: { type: Number, default: 0 }, // in minutes
    completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
    startedAt: Date,
    completedAt: Date,
    lastAccessedAt: Date
  },
  rating: {
    difficulty: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    relevance: { type: Number, min: 1, max: 5 },
    userRating: { type: Number, min: 1, max: 5 }
  },
  tags: [String],
  category: String,
  aiAnalysis: {
    concepts: [String],
    prerequisites: [String],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    estimatedTime: Number, // in minutes
    nextRecommendations: [String]
  }
}, {
  timestamps: true
});

// Indexes for performance
lessonSchema.index({ userId: 1, 'progress.status': 1 });
lessonSchema.index({ goalId: 1 });
lessonSchema.index({ category: 1, tags: 1 });
lessonSchema.index({ 'source.platform': 1, 'source.videoId': 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
