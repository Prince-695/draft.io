import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai';
import { useUIStore } from '@/stores/uiStore';

// AI monthly quota hook
// Fetches used/limit on mount; the axios interceptor in client.ts keeps it live after every AI call
export function useAIUsage() {
  const setAIUsage = useUIStore((s) => s.setAIUsage);
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const data = await aiApi.getUsage();
      setAIUsage(data.used, data.limit);
      return data;
    },
    staleTime: 60_000, // re-fetch at most once per minute
    refetchOnWindowFocus: false,
  });
}

// Generate content hook
export function useGenerateContent() {
  return useMutation({
    mutationFn: (data: { prompt: string; context?: string }) =>
      aiApi.generateContent(data),
  });
}

// Generate titles hook
export function useGenerateTitles() {
  return useMutation({
    mutationFn: (topic: string) => aiApi.generateTitles(topic),
  });
}

// Generate outline hook
export function useGenerateOutline() {
  return useMutation({
    mutationFn: (topic: string) => aiApi.generateOutline(topic),
  });
}

// Grammar check hook
export function useGrammarCheck() {
  return useMutation({
    mutationFn: (data: {
      content: string;
      instructions?: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) => aiApi.checkGrammar(data),
  });
}

// Improve content hook
export function useImproveContent() {
  return useMutation({
    mutationFn: (data: {
      content: string;
      instructions?: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) => aiApi.improveContent(data),
  });
}

// SEO suggestions hook
export function useSEOSuggestions() {
  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      aiApi.getSEOSuggestions(data),
  });
}
