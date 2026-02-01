export interface AIRequest {
  userId: string;
  userPlan: 'free' | 'premium';
}

export interface ContentGenerationRequest extends AIRequest {
  topic: string;
  tone?: 'professional' | 'casual' | 'technical' | 'creative';
  length?: 'short' | 'medium' | 'long';
}

export interface GrammarCheckRequest extends AIRequest {
  content: string;
}

export interface ContentImprovementRequest extends AIRequest {
  content: string;
  improvementType?: 'clarity' | 'engagement' | 'professionalism' | 'all';
}

export interface SEOSuggestionsRequest extends AIRequest {
  content: string;
  targetKeywords?: string[];
}

export interface SummarizationRequest extends AIRequest {
  content: string;
  maxLength?: number;
}

export interface TitleSuggestionsRequest extends AIRequest {
  content: string;
  count?: number;
}

export interface OutlineGenerationRequest extends AIRequest {
  topic: string;
  sections?: number;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokensUsed: number;
    remainingQuota: number;
  };
}
