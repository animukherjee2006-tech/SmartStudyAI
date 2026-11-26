import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is missing in .env file');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function cleanJsonText(rawText) {
  if (!rawText) return '{}';
  return rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

/**
 * Generates structured JSON study data using Gemini.
 * @param {string} systemPrompt
 * @param {string} userNotes
 * @returns {Promise<Object>}
 */
export async function generateStructuredStudyData(systemPrompt, userNotes) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userNotes,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = cleanJsonText(response.text);
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('AI failed to process the notes. Please try again.');
  }
}

/**
 * Generates a grounded academic chat response for RAG PDF study assistant.
 * @param {string} systemPrompt
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function generateChatAnswer(systemPrompt, prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });
    return response.text?.trim() || 'I could not generate an answer from the provided excerpts.';
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    throw new Error('AI assistant could not answer right now. Please try again.');
  }
}

/**
 * Generates a vector embedding for a text chunk, returning null if unavailable.
 * @param {string} text
 * @returns {Promise<number[] | null>}
 */
export async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text.slice(0, 4000),
    });
    const values = response?.embeddings?.[0]?.values || response?.embedding?.values;
    return Array.isArray(values) ? values : null;
  } catch {
    return null;
  }
}
