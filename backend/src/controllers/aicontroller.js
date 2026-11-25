import { generateStructuredStudyData } from '../config/gemini.js';
import { quizPrompt } from '../prompts/quizprompt.js';
import { notesPrompt } from '../prompts/notesprompt.js';
import StudyNote from '../models/StudyNote.js';
import Quiz from '../models/Quiz.js';
import StudySession from '../models/StudySession.js';
import StudyMaterial from '../models/StudyMaterial.js';

const MAX_NOTES_LENGTH = 30000;

async function resolveInputText(req) {
  let { notes, materialId } = req.body;

  if (materialId && req.user) {
    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: req.user._id,
    }).select('+extractedText');

    if (!material) {
      return { error: { status: 404, message: 'Selected study material was not found.' } };
    }
    if (!material.extractedText || material.extractedText.trim().length < 20) {
      return { error: { status: 400, message: 'Selected PDF does not contain enough readable text.' } };
    }
    notes = material.extractedText.slice(0, MAX_NOTES_LENGTH);
  }

  if (!notes || typeof notes !== 'string' || notes.trim().length < 20) {
    return { error: { status: 400, message: 'Please provide at least 20 characters of study notes.' } };
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    return {
      error: {
        status: 400,
        message: `Notes are too long. Please keep it under ${MAX_NOTES_LENGTH} characters.`,
      },
    };
  }

  return { text: notes.trim(), materialId: materialId || null };
}

/**
 * POST /api/ai/generate-quiz
 * Generates MCQs from study notes or an uploaded material.
 */
export async function createQuiz(req, res) {
  try {
    const resolved = await resolveInputText(req);
    if (resolved.error) {
      return res.status(resolved.error.status).json({
        success: false,
        message: resolved.error.message,
      });
    }

    const quizData = await generateStructuredStudyData(quizPrompt, resolved.text);
    let savedQuiz = null;

    if (req.user && Array.isArray(quizData?.mcqs) && quizData.mcqs.length > 0) {
      savedQuiz = await Quiz.create({
        userId: req.user._id,
        topic: quizData.topic || 'Practice Quiz',
        sourceText: resolved.text.slice(0, 2000),
        mcqs: quizData.mcqs,
        materialId: resolved.materialId,
      });
    }

    return res.status(200).json({
      success: true,
      data: quizData,
      quizId: savedQuiz?._id || null,
    });
  } catch (error) {
    console.error('Create Quiz Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz. Please try again.',
    });
  }
}

/**
 * POST /api/ai/generate-notes
 * Generates structured academic notes, concepts, definitions, flashcards, and Q&A.
 */
export async function createStudyNotes(req, res) {
  try {
    const resolved = await resolveInputText(req);
    if (resolved.error) {
      return res.status(resolved.error.status).json({
        success: false,
        message: resolved.error.message,
      });
    }

    const studyKitData = await generateStructuredStudyData(notesPrompt, resolved.text);
    let savedNote = null;

    if (req.user && studyKitData) {
      savedNote = await StudyNote.create({
        userId: req.user._id,
        topicTitle: studyKitData.topic_title || 'Academic Revision Notes',
        sourceText: resolved.text.slice(0, 2000),
        quickSummary: Array.isArray(studyKitData.quick_summary) ? studyKitData.quick_summary : [],
        importantConcepts: Array.isArray(studyKitData.important_concepts)
          ? studyKitData.important_concepts
          : [],
        detailedExplanations: Array.isArray(studyKitData.detailed_explanations)
          ? studyKitData.detailed_explanations
          : [],
        keyPoints: Array.isArray(studyKitData.key_points) ? studyKitData.key_points : [],
        definitions: Array.isArray(studyKitData.definitions) ? studyKitData.definitions : [],
        flashcards: Array.isArray(studyKitData.flashcards) ? studyKitData.flashcards : [],
        shortQuestions: Array.isArray(studyKitData.short_questions)
          ? studyKitData.short_questions
          : [],
        materialId: resolved.materialId,
      });

      await StudySession.create({
        userId: req.user._id,
        type: 'notes',
        topic: savedNote.topicTitle,
        referenceId: savedNote._id,
        metadata: {
          flashcardCount: savedNote.flashcards.length,
          questionCount: savedNote.shortQuestions.length,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: studyKitData,
      noteId: savedNote?._id || null,
    });
  } catch (error) {
    console.error('Create Study Notes Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate study kit. Please try again.',
    });
  }
}
