import { create } from 'zustand';
import type { ChatMessage, User } from '@/types';

interface Conversation {
  user: User;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: User | null;
  messages: ChatMessage[];
  onlineUsers: Set<string>;
  isTyping: boolean;
  typingUsers: Set<string>;
}

interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (user: User | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setTyping: (isTyping: boolean) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  markAsRead: (conversationUserId: string) => void;
}

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set) => ({
  // Initial state
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: new Set(),
  isTyping: false,
  typingUsers: new Set(),

  // Actions
  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (user) => set({ activeConversation: user, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),

  addOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    }),

  removeOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),

  setTyping: (isTyping) => set({ isTyping }),

  addTypingUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.typingUsers);
      newSet.add(userId);
      return { typingUsers: newSet };
    }),

  removeTypingUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.typingUsers);
      newSet.delete(userId);
      return { typingUsers: newSet };
    }),

  markAsRead: (conversationUserId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.user.id === conversationUserId ? { ...conv, unreadCount: 0 } : conv
      ),
    })),
}));
