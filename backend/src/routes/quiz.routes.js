import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getQuizHistory,
  saveQuizResult,
  deleteQuizResult,
} from '../controllers/quiz.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getQuizHistory);
router.post('/results', saveQuizResult);
router.delete('/results/:id', deleteQuizResult);

export default router;
