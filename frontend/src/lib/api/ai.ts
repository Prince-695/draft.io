import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { ApiResponse } from '@/types';

interface GenerateContentRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

interface ImproveContentRequest {
  content: string;
  instructions?: string;
}

interface GrammarCheckRequest {
  content: string;
}

interface SEOSuggestionsRequest {
  title: string;
  content: string;
}

interface AIResponse {
  result: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const aiApi = {
  // Generate blog content from prompt
  generateContent: async (data: GenerateContentRequest): Promise<ApiResponse<AIResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.GENERATE, data);
    return response.data;
  },

  // Generate title suggestions
  generateTitles: async (topic: string): Promise<ApiResponse<{ titles: string[] }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.TITLES, { topic });
    return response.data;
  },

  // Generate blog outline
  generateOutline: async (topic: string): Promise<ApiResponse<{ outline: string[] }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.OUTLINE, { topic });
    return response.data;
  },

  // Check grammar and spelling
  checkGrammar: async (data: GrammarCheckRequest): Promise<ApiResponse<AIResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.GRAMMAR, data);
    return response.data;
  },

  // Improve content quality
  improveContent: async (data: ImproveContentRequest): Promise<ApiResponse<AIResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.IMPROVE, data);
    return response.data;
  },

  // Get SEO suggestions
  getSEOSuggestions: async (data: SEOSuggestionsRequest): Promise<ApiResponse<{ suggestions: string[] }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.SEO, data);
    return response.data;
  },
};
