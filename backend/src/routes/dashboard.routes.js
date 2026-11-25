import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getHistory,
  deleteHistoryItem,
  getSettings,
  updateSettings,
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistoryItem);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
