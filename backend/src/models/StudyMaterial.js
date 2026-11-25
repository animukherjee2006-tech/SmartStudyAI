import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      trim: true,
      default: 'General',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'error'],
      default: 'ready',
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      default: '',
      select: false,
    },
    chunks: {
      type: [
        {
          index: Number,
          content: String,
          embedding: [Number],
        },
      ],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

studyMaterialSchema.index({ userId: 1, createdAt: -1 });
studyMaterialSchema.index({ userId: 1, subject: 1 });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
