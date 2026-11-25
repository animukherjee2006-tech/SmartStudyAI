import StudyNote from '../models/StudyNote.js';
import QuizResult from '../models/QuizResult.js';
import FlashcardDeck from '../models/FlashcardDeck.js';
import StudyMaterial from '../models/StudyMaterial.js';
import StudySession from '../models/StudySession.js';
import UserSettings from '../models/UserSettings.js';

export async function getDashboardStats(req, res) {
  try {
    const userId = req.user._id;

    const [
      totalSessions,
      notesCount,
      quizResults,
      decksCount,
      materialsCount,
      recentSessions,
      recentNotes,
      settings,
    ] = await Promise.all([
      StudySession.countDocuments({ userId }),
      StudyNote.countDocuments({ userId }),
      QuizResult.find({ userId }).sort({ createdAt: -1 }),
      FlashcardDeck.countDocuments({ userId }),
      StudyMaterial.countDocuments({ userId }),
      StudySession.find({ userId }).sort({ createdAt: -1 }).limit(8),
      StudyNote.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('topicTitle createdAt flashcards shortQuestions'),
      UserSettings.findOne({ userId }),
    ]);

    const quizzesCompleted = quizResults.length;
    const averageQuizScore =
      quizzesCompleted > 0
        ? Math.round(
            quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / quizzesCompleted
          )
        : 0;

    // Build last 7 days activity chart from real StudySession timestamps
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentWeekSessions = await StudySession.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).select('createdAt type');

    const weeklyActivity = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = recentWeekSessions.filter(
        (s) => s.createdAt.toISOString().slice(0, 10) === dayKey
      ).length;
      weeklyActivity.push({ label, date: dayKey, count });
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const completedToday = recentWeekSessions.filter(
      (s) => s.createdAt.toISOString().slice(0, 10) === todayKey
    ).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalSessions,
        notesCount,
        quizzesCompleted,
        averageQuizScore,
        decksCount,
        materialsCount,
        completedToday,
        dailyGoal: settings?.dailyGoal || 5,
      },
      weeklyActivity,
      recentSessions,
      continueLearning: recentNotes,
    });
  } catch (error) {
    console.error('GetDashboardStats Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics.',
    });
  }
}

export async function getHistory(req, res) {
  try {
    const userId = req.user._id;
    const { type, search, dateFrom } = req.query;

    const query = { userId };
    if (type && type !== 'all') {
      query.type = type;
    }
    if (search && search.trim()) {
      query.topic = { $regex: search.trim(), $options: 'i' };
    }
    if (dateFrom) {
      query.createdAt = { $gte: new Date(dateFrom) };
    }

    const [sessions, quizResults, notes] = await Promise.all([
      StudySession.find(query).sort({ createdAt: -1 }).limit(100),
      QuizResult.find({ userId }).sort({ createdAt: -1 }).limit(50),
      StudyNote.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select('topicTitle createdAt quickSummary flashcards shortQuestions'),
    ]);

    return res.status(200).json({
      success: true,
      sessions,
      quizResults,
      notes,
    });
  } catch (error) {
    console.error('GetHistory Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve study history.',
    });
  }
}

export async function deleteHistoryItem(req, res) {
  try {
    const deleted = await StudySession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'History item not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'History entry removed.',
    });
  } catch (error) {
    console.error('DeleteHistoryItem Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete history entry.',
    });
  }
}

export async function getSettings(req, res) {
  try {
    let settings = await UserSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user._id });
    }
    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('GetSettings Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load settings.',
    });
  }
}

export async function updateSettings(req, res) {
  try {
    const { notifications, theme, dailyGoal } = req.body;
    const updates = {};

    if (notifications) {
      updates.notifications = {
        emailDigest: Boolean(notifications.emailDigest),
        studyReminders: Boolean(notifications.studyReminders),
        quizAlerts: Boolean(notifications.quizAlerts),
      };
    }
    if (theme && ['academic_cream', 'classic_white'].includes(theme)) {
      updates.theme = theme;
    }
    if (dailyGoal !== undefined) {
      const goalNum = Number(dailyGoal);
      if (goalNum >= 1 && goalNum <= 50) {
        updates.dailyGoal = goalNum;
      }
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Preferences saved.',
      settings,
    });
  } catch (error) {
    console.error('UpdateSettings Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save preferences.',
    });
  }
}
