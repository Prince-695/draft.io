import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { ApiResponse } from '@/types';

// ─── Normalised response shape consumed by the write page ───────────────────
// Every AI call ultimately exposes `data.result` so the write page doesn't
// need to know about individual backend field names.
export interface NormalizedAIResponse {
  result: string;
  [key: string]: unknown;
}

export const aiApi = {
  // Generate blog content from prompt
  // Backend expects { topic, tone?, length? }
  generateContent: async (data: {
    prompt: string;
    context?: string;
  }): Promise<ApiResponse<NormalizedAIResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.GENERATE, {
      topic: data.prompt,
      tone: 'professional',
      length: 'medium',
    });
    const raw = response.data;
    // Backend returns data.content — expose as data.result
    return {
      ...raw,
      data: { ...(raw.data ?? {}), result: raw.data?.content ?? '' },
    };
  },

  // Generate title suggestions
  // Backend expects { content, count? } — we treat topic as initial content seed
  generateTitles: async (topic: string): Promise<ApiResponse<{ titles: string[] }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.TITLES, {
      content: topic,
      count: 5,
    });
    const raw = response.data;
    // Backend returns an array of title strings or newline-separated text
    const titlesRaw: unknown = raw.data?.titles ?? raw.data;
    const titles: string[] = Array.isArray(titlesRaw)
      ? titlesRaw
      : String(titlesRaw ?? '')
          .split('\n')
          .map((t: string) => t.trim())
          .filter(Boolean);
    return { ...raw, data: { titles } };
  },

  // Generate blog outline
  // Backend expects { topic, sections? }
  generateOutline: async (topic: string): Promise<ApiResponse<{ outline: string[] }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.OUTLINE, {
      topic,
      sections: 5,
    });
    const raw = response.data;
    const outlineRaw: unknown = raw.data?.outline ?? raw.data;
    const outline: string[] = Array.isArray(outlineRaw)
      ? outlineRaw
      : String(outlineRaw ?? '')
          .split('\n')
          .map((t: string) => t.trim())
          .filter(Boolean);
    return { ...raw, data: { outline } };
  },

  // Check grammar and spelling
  // Backend expects { content, instructions?, conversationHistory? }
  checkGrammar: async (data: {
    content: string;
    instructions?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<ApiResponse<NormalizedAIResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.GRAMMAR, {
      content: data.content,
      ...(data.instructions ? { instructions: data.instructions } : {}),
      ...(data.conversationHistory?.length ? { conversationHistory: data.conversationHistory } : {}),
    });
    const raw = response.data;
    // Expose correctedText as result so write page can replace editor content
    return {
      ...raw,
      data: { ...(raw.data ?? {}), result: raw.data?.correctedText ?? raw.data?.result ?? '' },
    };
  },

  // Improve content quality
  // Backend expects { content, improvementType?, instructions?, conversationHistory? }
  improveContent: async (data: {
    content: string;
    instructions?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<ApiResponse<NormalizedAIResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.IMPROVE, {
      content: data.content,
      // Only send improvementType when there's no custom instruction
      ...(data.instructions ? { instructions: data.instructions } : { improvementType: 'all' }),
      ...(data.conversationHistory?.length ? { conversationHistory: data.conversationHistory } : {}),
    });
    const raw = response.data;
    return {
      ...raw,
      data: { ...(raw.data ?? {}), result: raw.data?.improvedContent ?? raw.data?.result ?? '' },
    };
  },

  // Get SEO suggestions
  // Backend expects { content, targetKeywords? } — we combine title + content
  getSEOSuggestions: async (data: {
    title: string;
    content: string;
  }): Promise<ApiResponse<NormalizedAIResponse & { suggestions: unknown }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.SEO, {
      content: `Title: ${data.title}\n\n${data.content}`,
    });
    const raw = response.data;
    // Expose both the rich structured data AND a flattened suggestions field
    const suggestions = raw.data?.suggestions ?? raw.data ?? {};
    return {
      ...raw,
      data: { ...(raw.data ?? {}), result: JSON.stringify(raw.data ?? {}), suggestions },
    };
  },
};
