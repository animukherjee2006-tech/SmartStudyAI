import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    sourceText: {
      type: String,
      default: '',
    },
    mcqs: [
      {
        question: { type: String, required: true },
        options: {
          type: [String],
          validate: [(val) => val.length === 4, 'Each MCQ must have 4 options'],
        },
        correct_index: { type: Number, required: true, min: 0, max: 3 },
        explanation: { type: String, default: '' },
      },
    ],
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Quiz', quizSchema);
