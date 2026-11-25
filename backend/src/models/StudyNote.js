import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topicTitle: {
      type: String,
      required: true,
      trim: true,
    },
    sourceText: {
      type: String,
      default: '',
    },
    quickSummary: {
      type: [String],
      default: [],
    },
    importantConcepts: {
      type: [String],
      default: [],
    },
    detailedExplanations: [
      {
        concept: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    keyPoints: {
      type: [String],
      default: [],
    },
    definitions: [
      {
        term: { type: String, required: true },
        definition: { type: String, required: true },
      },
    ],
    flashcards: [
      {
        front: { type: String, required: true },
        back: { type: String, required: true },
      },
    ],
    shortQuestions: [
      {
        question: { type: String, required: true },
        model_answer: { type: String, required: true },
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

studyNoteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('StudyNote', studyNoteSchema);
