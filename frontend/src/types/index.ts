// Global type definitions for Draft.IO frontend

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  bio?: string;
  interests?: string[];
  expertise_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface Blog {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url?: string;
  status: 'draft' | 'published';
  tags: string[];
  category?: string;
  reading_time?: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: User;
  replies?: Comment[];
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id?: string;
  conversationId?: string;
  message: string;
  read_at?: string;
  created_at: string;
  sender?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'message';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  actor?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
