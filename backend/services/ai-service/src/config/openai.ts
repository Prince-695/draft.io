import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Default model configuration
export const DEFAULT_MODEL = 'gpt-4o-mini';

// Generation config
export const generationConfig = {
  temperature: 0.7,
  max_tokens: Number(process.env.MAX_GENERATION_TOKENS) || 2000,
  top_p: 0.95,
};

export default openai;
