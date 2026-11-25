import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import StudyMaterial from '../models/StudyMaterial.js';
import StudySession from '../models/StudySession.js';
import {
  extractPdfContent,
  chunkText,
  embedChunks,
  answerFromChunks,
} from '../services/ragService.js';

export async function getMaterials(req, res) {
  try {
    const { search, subject } = req.query;
    const query = { userId: req.user._id };

    if (subject && subject !== 'All') {
      query.subject = subject;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { originalName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      materials,
    });
  } catch (error) {
    console.error('GetMaterials Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load study materials.',
    });
  }
}

export async function uploadMaterial(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF file to upload.',
      });
    }

    const { title, subject } = req.body;
    const cleanTitle = (title || req.file.originalname.replace(/\.pdf$/i, '')).trim();
    const cleanSubject = (subject || 'General').trim();

    let extractedText = '';
    let pageCount = 0;
    let chunks = [];
    let status = 'ready';

    try {
      const parsed = await extractPdfContent(req.file.path);
      extractedText = parsed.text;
      pageCount = parsed.pageCount;

      if (extractedText.length > 0) {
        const rawChunks = chunkText(extractedText);
        chunks = await embedChunks(rawChunks);
      }
    } catch (parseErr) {
      console.error('PDF Parse Error:', parseErr.message);
      status = 'error';
    }

    const material = await StudyMaterial.create({
      userId: req.user._id,
      title: cleanTitle,
      originalName: req.file.originalname,
      subject: cleanSubject,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      status,
      pageCount,
      extractedText,
      chunks,
    });

    await StudySession.create({
      userId: req.user._id,
      type: 'material',
      topic: material.title,
      referenceId: material._id,
      metadata: { subject: material.subject, pageCount },
    });

    const responseDoc = material.toObject();
    delete responseDoc.extractedText;
    delete responseDoc.chunks;

    return res.status(201).json({
      success: true,
      message:
        status === 'ready'
          ? 'Document uploaded and indexed for AI study.'
          : 'Document uploaded, but text extraction encountered an issue.',
      material: responseDoc,
    });
  } catch (error) {
    console.error('UploadMaterial Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload study material.',
    });
  }
}

export async function getMaterialById(req, res) {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('+extractedText');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found.',
      });
    }

    return res.status(200).json({
      success: true,
      material: {
        _id: material._id,
        title: material.title,
        originalName: material.originalName,
        subject: material.subject,
        fileSize: material.fileSize,
        pageCount: material.pageCount,
        status: material.status,
        createdAt: material.createdAt,
        extractedPreview: (material.extractedText || '').slice(0, 4000),
        textLength: (material.extractedText || '').length,
      },
    });
  } catch (error) {
    console.error('GetMaterialById Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load document details.',
    });
  }
}

export async function downloadMaterial(req, res) {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found.',
      });
    }

    const resolvedPath = path.resolve(material.filePath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'Original PDF file is no longer available on disk.',
      });
    }

    res.setHeader('Content-Type', material.mimeType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(material.originalName)}"`
    );
    return fs.createReadStream(resolvedPath).pipe(res);
  } catch (error) {
    console.error('DownloadMaterial Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to open document.',
    });
  }
}

export async function deleteMaterial(req, res) {
  try {
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found.',
      });
    }

    if (material.filePath) {
      try {
        await fsPromises.unlink(path.resolve(material.filePath));
      } catch {
        // Ignore if already removed
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Study material deleted.',
    });
  } catch (error) {
    console.error('DeleteMaterial Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete study material.',
    });
  }
}

export async function chatWithMaterial(req, res) {
  try {
    const { question } = req.body;
    if (!question || question.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid question (at least 3 characters).',
      });
    }

    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('+chunks');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found.',
      });
    }

    const result = await answerFromChunks(question.trim(), material.chunks, material.title);

    await StudySession.create({
      userId: req.user._id,
      type: 'rag_chat',
      topic: `Q&A: ${material.title}`,
      referenceId: material._id,
      metadata: { question: question.trim().slice(0, 120) },
    });

    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error('ChatWithMaterial Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to answer question from document.',
    });
  }
}
