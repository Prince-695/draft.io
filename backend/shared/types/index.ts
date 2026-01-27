// Shared TypeScript Types
// These types are used across all microservices

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  bio?: string;
  cover_image_url?: string;
  interests: string[];  // ['Technology', 'AI', 'Lifestyle']
  expertise_tags: string[];  // ['JavaScript', 'React', 'Node.js']
  created_at: Date;
  updated_at: Date;
}

// ============================================
// BLOG TYPES
// ============================================

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Blog {
  id: string;
  user_id: string;
  title: string;
  slug: string;  // URL-friendly version of title
  content: string;  // Rich text/markdown
  excerpt?: string;  // Short preview
  cover_image_url?: string;
  status: BlogStatus;
  tags: string[];
  category: string;
  reading_time: number;  // In minutes
  views_count: number;
  likes_count: number;
  comments_count: number;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// ENGAGEMENT TYPES
// ============================================

export interface Like {
  user_id: string;
  blog_id: string;
  created_at: Date;
}

export interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  parent_comment_id?: string;  // For nested replies
  content: string;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Bookmark {
  user_id: string;
  blog_id: string;
  created_at: Date;
}

// ============================================
// KAFKA EVENT TYPES
// ============================================

export interface KafkaEvent<T = any> {
  event_type: string;
  timestamp: Date;
  data: T;
}

export interface UserRegisteredEvent {
  user_id: string;
  email: string;
  username: string;
}

export interface BlogPublishedEvent {
  blog_id: string;
  user_id: string;
  title: string;
  tags: string[];
  category: string;
}

export interface UserFollowedEvent {
  follower_id: string;
  following_id: string;
}

export interface EngagementCreatedEvent {
  type: 'like' | 'comment' | 'share';
  user_id: string;
  blog_id: string;
  comment_id?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
