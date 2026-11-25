import rateLimit from 'express-rate-limit';

// Per-minute limiter: Ek user 1 minute mein max 5 AI generations kar sakta hai
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Per IP max 5 requests per windowMs
  standardHeaders: true, // RateLimit-* headers return karega
  legacyHeaders: false, // Purane X-RateLimit-* headers disable rakhega
  message: {
    success: false,
    message: 'Too many requests! Please wait 1 minute before generating more notes or quizzes.',
  },
});

// Daily limiter (Optional safety net): Ek IP se 1 din mein max 30 generations
export const dailyAiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Daily free limit (30 generations) reached. Please come back tomorrow!',
  },
});
