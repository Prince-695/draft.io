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
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  MY_POSTS: '/my-posts',
  EXPLORE: '/explore',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  PROFILE_EDIT: '/profile/edit',
  WRITE: '/write',
  BLOG: '/blog',
  CHAT: '/chat',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  FEED: '/feed',
  MESSAGES: '/messages',
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
    GET_BY_ID: '/api/users/profile/id',
    UPDATE_PROFILE: '/api/users/profile',
    PERSONALIZE: '/api/users/profile/personalize',
    UPLOAD_AVATAR: '/api/users/profile/avatar',
    UPLOAD_COVER: '/api/users/profile/cover',
    SEARCH: '/api/users/profile/search/users',
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
    USER_BLOGS: '/api/blogs/user',
  },
  ENGAGEMENT: {
    LIKE: '/api/engagement',
    UNLIKE: '/api/engagement',
    COMMENT: '/api/engagement',
    BOOKMARK: '/api/engagement',
    BOOKMARKS: '/api/engagement/bookmarks',
  },
  AI: {
    GENERATE: '/api/ai/generate/content',
    TITLES: '/api/ai/generate/titles',
    OUTLINE: '/api/ai/generate/outline',
    GRAMMAR: '/api/ai/improve/grammar',
    IMPROVE: '/api/ai/improve/content',
    SEO: '/api/ai/seo/suggestions',
    SUMMARIZE: '/api/ai/summarize',
    USAGE: '/api/ai/usage',
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
