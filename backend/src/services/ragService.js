import fs from 'fs/promises';
import { createRequire } from 'module';
import { generateChatAnswer, generateEmbedding } from '../config/gemini.js';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

/**
 * Extracts text and page count from a PDF buffer or file path.
 */
export async function extractPdfContent(filePath) {
  const dataBuffer = await fs.readFile(filePath);

  // Support both pdf-parse v1 function export and v2 PDFParse class export
  if (typeof pdfParseModule === 'function') {
    const parsed = await pdfParseModule(dataBuffer);
    return {
      text: (parsed.text || '').trim(),
      pageCount: parsed.numpages || 1,
    };
  }

  if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
    const parser = new pdfParseModule.PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy?.();
    return {
      text: (result?.text || '').trim(),
      pageCount: result?.total || result?.pages?.length || 1,
    };
  }

  throw new Error('PDF parser is not available');
}

/**
 * Splits extracted document text into overlapping chunks for RAG retrieval.
 */
export function chunkText(text, chunkSize = 1000, overlap = 180) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const slice = clean.slice(start, end).trim();
    if (slice.length > 20) {
      chunks.push({ index, content: slice });
      index += 1;
    }
    if (end >= clean.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Computes embeddings for chunks (with graceful fallback if embedding API is unavailable).
 */
export async function embedChunks(chunks) {
  const embedded = [];
  // Cap embedding calls per upload to avoid rate limits on huge PDFs
  const maxEmbed = Math.min(chunks.length, 30);

  for (let i = 0; i < chunks.length; i += 1) {
    let embedding = [];
    if (i < maxEmbed) {
      const vec = await generateEmbedding(chunks[i].content);
      if (vec) embedding = vec;
    }
    embedded.push({
      index: chunks[i].index,
      content: chunks[i].content,
      embedding,
    });
  }
  return embedded;
}

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function lexicalScore(query, text) {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'what', 'how', 'why', 'explain', 'about',
  ]);
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (!tokens.length) return 0;
  const lowerText = text.toLowerCase();
  let matches = 0;
  for (const token of tokens) {
    if (lowerText.includes(token)) {
      matches += 1;
    }
  }
  return matches / tokens.length;
}

/**
 * Retrieves top-K relevant chunks and generates a grounded answer via Gemini.
 */
export async function answerFromChunks(question, chunks, documentTitle) {
  if (!chunks || chunks.length === 0) {
    return {
      answer: 'This document does not contain searchable text chunks. Please upload a text-based PDF.',
      sources: [],
    };
  }

  const queryEmbedding = await generateEmbedding(question);

  const scored = chunks.map((chunk) => {
    const vectorScore =
      queryEmbedding && chunk.embedding?.length
        ? cosineSimilarity(queryEmbedding, chunk.embedding)
        : 0;
    const keywordScore = lexicalScore(question, chunk.content);
    const combined = queryEmbedding && chunk.embedding?.length
      ? vectorScore * 0.75 + keywordScore * 0.25
      : keywordScore;

    return {
      index: chunk.index,
      content: chunk.content,
      score: combined,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 4).filter((c) => c.score > 0 || scored[0].score === 0);

  if (topChunks.length === 0) {
    return {
      answer: 'No relevant passages were found in your uploaded document for this question.',
      sources: [],
    };
  }

  const contextBlock = topChunks
    .map((c, idx) => `[Excerpt ${idx + 1} - Section #${c.index + 1}]:\n${c.content}`)
    .join('\n\n');

  const systemPrompt = `You are StudyBuddy AI, an academic research assistant. Answer the student's question ONLY using the provided document excerpts from "${documentTitle}".
If the excerpts do not contain enough information to answer, clearly state that the uploaded document does not cover that detail.
Cite the relevant section numbers (e.g., [Section #1]) when referencing facts.`;

  const userPrompt = `DOCUMENT EXCERPTS:\n${contextBlock}\n\nSTUDENT QUESTION:\n${question}`;
  const answer = await generateChatAnswer(systemPrompt, userPrompt);

  return {
    answer,
    sources: topChunks.map((c) => ({
      section: c.index + 1,
      excerpt: c.content.slice(0, 180) + (c.content.length > 180 ? '...' : ''),
    })),
  };
}
