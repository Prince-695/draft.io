import { Request, Response } from 'express';
import openai, { DEFAULT_MODEL, generationConfig } from '../config/openai';
import {
  ContentGenerationRequest,
  TitleSuggestionsRequest,
  OutlineGenerationRequest,
} from '../types/ai.types';

// Generate blog content from topic
export const generateContent = async (req: Request, res: Response) => {
  try {
    const { topic, tone = 'professional', length = 'medium' } = req.body as ContentGenerationRequest;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required',
      });
    }

    const lengthMap = {
      short: '300-500 words',
      medium: '700-1000 words',
      long: '1500-2000 words',
    };

    const prompt = `Write a ${tone} blog post about "${topic}". 
    The content should be approximately ${lengthMap[length]}.
    Make it engaging, informative, and well-structured with proper paragraphs.
    Do not include a title, just the main content.`;

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
        content: text,
        topic,
        tone,
        length,
      },
    });
  } catch (error: any) {
    console.error('Content generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content',
    });
  }
};

// Generate title suggestions
export const generateTitles = async (req: Request, res: Response) => {
  try {
    const { content, count = 5 } = req.body as TitleSuggestionsRequest;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const prompt = `Based on the following blog content, generate ${count} catchy, SEO-friendly title suggestions.
    Return only the titles, one per line, without numbering or bullet points.
    
    Content:
    ${content.substring(0, 1000)}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: generationConfig.temperature,
      max_tokens: 500,
      top_p: generationConfig.top_p,
    });

    const text = completion.choices[0]?.message?.content || '';
    const titles = text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(0, count);

    return res.json({
      success: true,
      data: {
        titles,
        count: titles.length,
      },
    });
  } catch (error: any) {
    console.error('Title generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate titles',
    });
  }
};

// Generate outline for a topic
export const generateOutline = async (req: Request, res: Response) => {
  try {
    const { topic, sections = 5 } = req.body as OutlineGenerationRequest;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required',
      });
    }

    const prompt = `Create a detailed blog post outline for the topic: "${topic}"
    Include approximately ${sections} main sections.
    For each section, provide:
    1. Section title
    2. 2-3 key points to cover
    
    Format the outline in a clear, hierarchical structure.`;

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
        outline: text,
        topic,
        sections,
      },
    });
  } catch (error: any) {
    console.error('Outline generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate outline',
    });
  }
};
