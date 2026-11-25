import FlashcardDeck from '../models/FlashcardDeck.js';
import StudySession from '../models/StudySession.js';
import { generateStructuredStudyData } from '../config/gemini.js';
import { flashcardPrompt } from '../prompts/flashcardprompt.js';

export async function getDecks(req, res) {
  try {
    const decks = await FlashcardDeck.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      decks,
    });
  } catch (error) {
    console.error('GetDecks Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load flashcard decks.',
    });
  }
}

export async function createDeck(req, res) {
  try {
    const { title, subject, description, cards, sourceText } = req.body;

    let deckTitle = title?.trim();
    let deckSubject = subject?.trim() || 'General';
    let deckCards = Array.isArray(cards) ? cards : [];

    // AI-generate flashcards if sourceText is provided and cards are empty
    if (sourceText && sourceText.trim().length >= 20 && deckCards.length === 0) {
      const aiResult = await generateStructuredStudyData(
        flashcardPrompt,
        sourceText.trim().slice(0, 30000)
      );
      deckTitle = deckTitle || aiResult.title || 'AI Flashcard Deck';
      deckSubject = subject?.trim() || aiResult.subject || 'General';
      deckCards = Array.isArray(aiResult.cards) ? aiResult.cards : [];
    }

    if (!deckTitle) {
      return res.status(400).json({
        success: false,
        message: 'Deck title is required.',
      });
    }

    if (deckCards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one flashcard or provide study notes to generate from.',
      });
    }

    const sanitizedCards = deckCards
      .filter((c) => c.front?.trim() && c.back?.trim())
      .map((c) => ({
        front: c.front.trim(),
        back: c.back.trim(),
        status: c.status || 'new',
      }));

    if (sanitizedCards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid front and back content is required for flashcards.',
      });
    }

    const deck = await FlashcardDeck.create({
      userId: req.user._id,
      title: deckTitle,
      subject: deckSubject,
      description: description?.trim() || '',
      cards: sanitizedCards,
    });

    await StudySession.create({
      userId: req.user._id,
      type: 'flashcards',
      topic: deck.title,
      referenceId: deck._id,
      metadata: { cardCount: deck.cards.length },
    });

    return res.status(201).json({
      success: true,
      deck,
    });
  } catch (error) {
    console.error('CreateDeck Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create flashcard deck.',
    });
  }
}

export async function updateCardStatus(req, res) {
  try {
    const { id, cardId } = req.params;
    const { status } = req.body;

    if (!['new', 'known', 'revision'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card status.',
      });
    }

    const deck = await FlashcardDeck.findOne({ _id: id, userId: req.user._id });
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found.',
      });
    }

    const card = deck.cards.id(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found.',
      });
    }

    card.status = status;
    await deck.save();

    return res.status(200).json({
      success: true,
      deck,
    });
  } catch (error) {
    console.error('UpdateCardStatus Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update flashcard status.',
    });
  }
}

export async function deleteDeck(req, res) {
  try {
    const deleted = await FlashcardDeck.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Flashcard deck deleted.',
    });
  } catch (error) {
    console.error('DeleteDeck Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard deck.',
    });
  }
}
