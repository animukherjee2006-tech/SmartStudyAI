import mongoose from 'mongoose';

const flashcardDeckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Deck title is required'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    cards: [
      {
        front: { type: String, required: true, trim: true },
        back: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: ['new', 'known', 'revision'],
          default: 'new',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

flashcardDeckSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('FlashcardDeck', flashcardDeckSchema);
