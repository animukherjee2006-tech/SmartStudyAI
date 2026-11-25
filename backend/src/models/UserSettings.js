import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: {
      emailDigest: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true },
      quizAlerts: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['academic_cream', 'classic_white'],
      default: 'academic_cream',
    },
    dailyGoal: {
      type: Number,
      default: 5,
      min: 1,
      max: 50,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('UserSettings', userSettingsSchema);
