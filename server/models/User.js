/**
 * ============================================
 *  User Model
 * ============================================
 *  Stores user profile data synced from Firebase Auth.
 *  firebaseUid is the primary identifier linking
 *  a Firebase account to our MongoDB document.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      dailyGoalHours: {
        type: Number,
        default: 2,
        min: 0.5,
        max: 16,
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
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual – count of study plans owned by this user
userSchema.virtual('planCount', {
  ref: 'StudyPlan',
  localField: '_id',
  foreignField: 'userId',
  count: true,
});

module.exports = mongoose.model('User', userSchema);
