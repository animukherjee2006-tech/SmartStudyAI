import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getDecks,
  createDeck,
  updateCardStatus,
  deleteDeck,
} from '../controllers/flashcard.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getDecks);
router.post('/', createDeck);
router.patch('/:id/cards/:cardId', updateCardStatus);
router.delete('/:id', deleteDeck);

export default router;
