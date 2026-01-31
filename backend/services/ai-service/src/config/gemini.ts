import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GOOGLE_GEMINI_API_KEY not found in environment variables');
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the generative model
export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Safety settings to ensure appropriate content
export const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

// Generation config
export const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: Number(process.env.MAX_GENERATION_TOKENS) || 2000,
};

export default genAI;
