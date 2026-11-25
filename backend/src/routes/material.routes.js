import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMaterials,
  uploadMaterial,
  getMaterialById,
  downloadMaterial,
  deleteMaterial,
  chatWithMaterial,
} from '../controllers/material.controller.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);
    cb(null, `${Date.now()}-${safeBase}.pdf`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!isPdf) {
      return cb(new Error('Only PDF documents are allowed.'));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.use(protect);

router.get('/', getMaterials);
router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/:id', getMaterialById);
router.get('/:id/download', downloadMaterial);
router.delete('/:id', deleteMaterial);
router.post('/:id/chat', chatWithMaterial);

export default router;
