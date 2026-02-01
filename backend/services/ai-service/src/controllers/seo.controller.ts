import { Request, Response } from 'express';
import openai, { DEFAULT_MODEL, generationConfig } from '../config/openai';
import {
  SEOSuggestionsRequest,
  SummarizationRequest,
} from '../types/ai.types';

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

    const keywordsText = targetKeywords.length > 0 
      ? `Target keywords: ${targetKeywords.join(', ')}` 
      : '';

    const prompt = `Analyze the following blog content and provide SEO improvement suggestions.
    ${keywordsText}
    
    Provide suggestions in the following areas:
    1. Meta title (50-60 characters)
    2. Meta description (150-160 characters)
    3. Keyword optimization recommendations
    4. Content structure improvements for SEO
    5. Internal/external linking suggestions
    6. Readability score and improvements
    
    Format your response as JSON with this structure:
    {
      "metaTitle": "...",
      "metaDescription": "...",
      "keywords": ["keyword1", "keyword2", ...],
      "structureImprovements": ["improvement1", "improvement2", ...],
      "linkingSuggestions": ["suggestion1", "suggestion2", ...],
      "readabilityScore": "good|fair|needs improvement",
      "readabilityTips": ["tip1", "tip2", ...]
    }
    
    Content:
    ${content.substring(0, 2000)}`;

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

    const prompt = `Summarize the following content in approximately ${maxLength} words.
    Make the summary concise, informative, and capture the key points.
    
    Content:
    ${content}`;

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
