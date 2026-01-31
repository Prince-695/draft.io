import { Request, Response } from 'express';
import { getGeminiModel, safetySettings, generationConfig } from '../config/gemini';
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

    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

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

    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

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
