import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getNotes, getNoteById, deleteNote } from '../controllers/notes.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);

export default router;
