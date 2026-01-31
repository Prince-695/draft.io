// Event Types for Kafka Messaging

export enum EventType {
  // Auth Events
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  USER_PASSWORD_RESET = 'user.password_reset',

  // User Events
  USER_FOLLOWED = 'user.followed',
  USER_UNFOLLOWED = 'user.unfollowed',
  USER_PROFILE_UPDATED = 'user.profile_updated',

  // Blog Events
  BLOG_CREATED = 'blog.created',
  BLOG_PUBLISHED = 'blog.published',
  BLOG_UPDATED = 'blog.updated',
  BLOG_DELETED = 'blog.deleted',

  // Engagement Events
  BLOG_LIKED = 'blog.liked',
  BLOG_UNLIKED = 'blog.unliked',
  BLOG_COMMENTED = 'blog.commented',
  BLOG_BOOKMARKED = 'blog.bookmarked',
  BLOG_SHARED = 'blog.shared',
}

// Base Event Interface
export interface BaseEvent {
  eventId: string;
  eventType: EventType;
  timestamp: string;
  version: string;
}

// User Events
export interface UserRegisteredEvent extends BaseEvent {
  eventType: EventType.USER_REGISTERED;
  data: {
    userId: string;
    email: string;
    username: string;
    fullName: string;
  };
}

export interface UserFollowedEvent extends BaseEvent {
  eventType: EventType.USER_FOLLOWED;
  data: {
    followerId: string;
    followingId: string;
  };
}

export interface UserUnfollowedEvent extends BaseEvent {
  eventType: EventType.USER_UNFOLLOWED;
  data: {
    followerId: string;
    followingId: string;
  };
}

// Blog Events
export interface BlogPublishedEvent extends BaseEvent {
  eventType: EventType.BLOG_PUBLISHED;
  data: {
    blogId: string;
    authorId: string;
    title: string;
    slug: string;
    tags: string[];
    categoryId?: number;
  };
}

export interface BlogUpdatedEvent extends BaseEvent {
  eventType: EventType.BLOG_UPDATED;
  data: {
    blogId: string;
    authorId: string;
    title: string;
    updatedFields: string[];
  };
}

export interface BlogDeletedEvent extends BaseEvent {
  eventType: EventType.BLOG_DELETED;
  data: {
    blogId: string;
    authorId: string;
  };
}

// Engagement Events
export interface BlogLikedEvent extends BaseEvent {
  eventType: EventType.BLOG_LIKED;
  data: {
    blogId: string;
    userId: string;
  };
}

export interface BlogCommentedEvent extends BaseEvent {
  eventType: EventType.BLOG_COMMENTED;
  data: {
    blogId: string;
    commentId: string;
    userId: string;
    parentCommentId?: string;
  };
}

export interface BlogBookmarkedEvent extends BaseEvent {
  eventType: EventType.BLOG_BOOKMARKED;
  data: {
    blogId: string;
    userId: string;
  };
}

// Union type for all events
export type DomainEvent =
  | UserRegisteredEvent
  | UserFollowedEvent
  | UserUnfollowedEvent
  | BlogPublishedEvent
  | BlogUpdatedEvent
  | BlogDeletedEvent
  | BlogLikedEvent
  | BlogCommentedEvent
  | BlogBookmarkedEvent;
