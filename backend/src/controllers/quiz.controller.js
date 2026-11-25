import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';
import StudySession from '../models/StudySession.js';

export async function getQuizHistory(req, res) {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const quizzes = await Quiz.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      results,
      quizzes,
    });
  } catch (error) {
    console.error('GetQuizHistory Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz history.',
    });
  }
}

export async function saveQuizResult(req, res) {
  try {
    const { quizId, topic, score, totalQuestions, answers } = req.body;

    if (!topic || score === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Topic, score, and totalQuestions are required.',
      });
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const result = await QuizResult.create({
      userId: req.user._id,
      quizId: quizId || null,
      topic: topic.trim(),
      score,
      totalQuestions,
      percentage,
      answers: Array.isArray(answers) ? answers : [],
    });

    await StudySession.create({
      userId: req.user._id,
      type: 'quiz',
      topic: topic.trim(),
      referenceId: result._id,
      score: percentage,
      metadata: { score, totalQuestions },
    });

    return res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('SaveQuizResult Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save quiz result.',
    });
  }
}

export async function deleteQuizResult(req, res) {
  try {
    const deleted = await QuizResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Quiz result deleted.',
    });
  } catch (error) {
    console.error('DeleteQuizResult Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete quiz result.',
    });
  }
}
