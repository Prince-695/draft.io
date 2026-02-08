// Constants for Draft.IO frontend

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Draft.IO';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5006';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  QUESTIONNAIRE: '/questionnaire',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  PROFILE_EDIT: '/profile/edit',
  WRITE: '/write',
  BLOG: '/blog',
  CHAT: '/chat',
  FEED: '/feed',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    GOOGLE: '/api/auth/google',
  },
  USER: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    UPLOAD_AVATAR: '/api/users/avatar',
    UPLOAD_COVER: '/api/users/cover',
    SEARCH: '/api/users/search',
    FOLLOW: '/api/users/follow',
    UNFOLLOW: '/api/users/unfollow',
    FOLLOWERS: '/api/users/followers',
    FOLLOWING: '/api/users/following',
  },
  BLOG: {
    LIST: '/api/blogs',
    CREATE: '/api/blogs',
    GET: '/api/blogs',
    UPDATE: '/api/blogs',
    DELETE: '/api/blogs',
    PUBLISH: '/api/blogs',
    SEARCH: '/api/blogs/search',
    TRENDING: '/api/blogs/trending',
    MY_BLOGS: '/api/blogs/my-blogs',
  },
  ENGAGEMENT: {
    LIKE: '/api/engagement',
    UNLIKE: '/api/engagement',
    COMMENT: '/api/engagement',
    BOOKMARK: '/api/engagement',
    BOOKMARKS: '/api/engagement/bookmarks',
  },
  AI: {
    GENERATE: '/api/ai/generate',
    TITLES: '/api/ai/titles',
    OUTLINE: '/api/ai/outline',
    GRAMMAR: '/api/ai/grammar-check',
    IMPROVE: '/api/ai/improve',
    SEO: '/api/ai/seo',
  },
  CHAT: {
    CONVERSATIONS: '/api/chat/conversations',
    MESSAGES: '/api/chat/messages',
    SEND: '/api/chat/send',
    MARK_READ: '/api/chat/mark-read',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/mark-read',
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: '/api/notifications',
  },
  RECOMMENDATIONS: {
    FEED: '/api/recommendations/feed',
    TRENDING: '/api/recommendations/trending',
    SIMILAR: '/api/recommendations/similar',
  },
} as const;

export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export const NOTIFICATION_TYPES = {
  FOLLOW: 'follow',
  LIKE: 'like',
  COMMENT: 'comment',
  MENTION: 'mention',
  MESSAGE: 'message',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  BLOGS: 'blogs',
  BLOG: 'blog',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  FEED: 'feed',
  TRENDING: 'trending',
} as const;
