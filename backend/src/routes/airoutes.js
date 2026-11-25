import express from 'express';
import { createQuiz, createStudyNotes } from '../controllers/aicontroller.js';
import { aiRateLimiter, dailyAiLimiter } from '../middleware/ratelimiter.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(aiRateLimiter);
router.use(dailyAiLimiter);
router.use(optionalAuth);

router.post('/generate-quiz', createQuiz);
router.post('/generate-notes', createStudyNotes);

export default router;
