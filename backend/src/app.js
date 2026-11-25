import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/airoutes.js';
import authRoutes from './routes/auth.routes.js';
import notesRoutes from './routes/notes.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import flashcardRoutes from './routes/flashcard.routes.js';
import materialRoutes from './routes/material.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyBuddy AI Backend is running!',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  if (err.message === 'Only PDF documents are allowed.' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File size exceeds the 10MB limit.'
          : err.message,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
