import { Request, Response } from 'express';
import openai, { DEFAULT_MODEL, generationConfig } from '../config/openai';
import {
  SEOSuggestionsRequest,
  SummarizationRequest,
} from '../types/ai.types';
import { buildGenerateSEOPrompt, buildSummarizeContentPrompt } from '../prompts';

// Generate SEO suggestions
export const generateSEO = async (req: Request, res: Response) => {
  try {
    const { content, targetKeywords = [] } = req.body as SEOSuggestionsRequest;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const prompt = buildGenerateSEOPrompt(content, targetKeywords);

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
      // If JSON parsing fails, return as raw suggestions
      return res.json({
        success: true,
        data: {
          suggestions: text,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        suggestions: text,
      },
    });
  } catch (error: any) {
    console.error('SEO generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate SEO suggestions',
    });
  }
};

// Summarize content
export const summarizeContent = async (req: Request, res: Response) => {
  try {
    const { content, maxLength = 200 } = req.body as SummarizationRequest;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const prompt = buildSummarizeContentPrompt(content, maxLength);

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: generationConfig.temperature,
      max_tokens: 500,
      top_p: generationConfig.top_p,
    });

    const text = completion.choices[0]?.message?.content || '';

    return res.json({
      success: true,
      data: {
        summary: text,
        originalLength: content.length,
        summaryLength: text.length,
        compressionRatio: ((1 - text.length / content.length) * 100).toFixed(1) + '%',
      },
    });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to summarize content',
    });
  }
};
