import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    answers: [
      {
        questionIndex: Number,
        selectedOption: Number,
        correctOption: Number,
        isCorrect: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

quizResultSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('QuizResult', quizResultSchema);
