import { Request, Response } from 'express';
import openai, { DEFAULT_MODEL, generationConfig } from '../config/openai';
import {
  GrammarCheckRequest,
  ContentImprovementRequest,
} from '../types/ai.types';

// Check grammar and spelling
export const checkGrammar = async (req: Request, res: Response) => {
  try {
    const { content } = req.body as GrammarCheckRequest;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const maxLength = Number(process.env.MAX_CONTENT_LENGTH) || 10000;
    if (content.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Content exceeds maximum length of ${maxLength} characters`,
      });
    }

    const prompt = `Check the following text for grammar, spelling, and punctuation errors.
    Provide a corrected version and list the specific errors found.
    
    Format your response as JSON with this structure:
    {
      "correctedText": "the corrected text here",
      "errors": [
        {"type": "grammar|spelling|punctuation", "original": "...", "correction": "...", "explanation": "..."}
      ],
      "errorCount": number
    }
    
    Text to check:
    ${content}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: generationConfig.temperature,
      max_tokens: generationConfig.max_tokens,
      top_p: generationConfig.top_p,
    });

    const text = completion.choices[0]?.message?.content || '';

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({
          success: true,
          data: parsed,
        });
      }
    } catch (parseError) {
      // If JSON parsing fails, return raw text
      return res.json({
        success: true,
        data: {
          correctedText: text,
          errors: [],
          errorCount: 0,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        correctedText: text,
        errors: [],
        errorCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Grammar check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to check grammar',
    });
  }
};

// Improve content quality
export const improveContent = async (req: Request, res: Response) => {
  try {
    const { content, improvementType = 'all' } = req.body as ContentImprovementRequest;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const maxLength = Number(process.env.MAX_CONTENT_LENGTH) || 10000;
    if (content.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Content exceeds maximum length of ${maxLength} characters`,
      });
    }

    const improvementPrompts = {
      clarity: 'Make the following text clearer and easier to understand while preserving its meaning.',
      engagement: 'Make the following text more engaging and captivating for readers.',
      professionalism: 'Improve the professionalism and tone of the following text.',
      all: 'Improve the following text by making it clearer, more engaging, and more professional.',
    };

    const prompt = `${improvementPrompts[improvementType]}
    
    Provide the improved version and explain the key changes made.
    
    Original text:
    ${content}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: generationConfig.temperature,
      max_tokens: generationConfig.max_tokens,
      top_p: generationConfig.top_p,
    });

    const text = completion.choices[0]?.message?.content || '';

    return res.json({
      success: true,
      data: {
        improvedContent: text,
        improvementType,
        originalLength: content.length,
        improvedLength: text.length,
      },
    });
  } catch (error: any) {
    console.error('Content improvement error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to improve content',
    });
  }
};
