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
  /**
   * Replace history for the [selfUserId ↔ otherUserId] conversation while
   * preserving real-time messages already in the store for OTHER conversations.
   * Any socket-received message for this conversation that isn't in the loaded
   * history (edge-case race) is merged in rather than dropped.
   */
  setConversationMessages: (otherUserId: string, selfUserId: string, loaded: ChatMessage[]) => void;
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

  // Update active conversation pointer (does NOT wipe messages)
  setActiveConversation: (user) => set({ activeConversation: user }),

  setMessages: (messages) => set({ messages }),

  setConversationMessages: (otherUserId, selfUserId, loaded) =>
    set((state) => {
      const loadedIds = new Set(loaded.map((m) => m.id).filter(Boolean));
      // Strip old stored messages for this conversation pair
      const otherConvMsgs = state.messages.filter((m) => {
        const belongsHere =
          (m.sender_id === selfUserId && m.receiver_id === otherUserId) ||
          (m.sender_id === otherUserId && m.receiver_id === selfUserId);
        return !belongsHere;
      });
      // Any realtime socket msg for this conv not yet in history (race edge case)
      const realtimeExtras = state.messages.filter((m) => {
        const belongsHere =
          (m.sender_id === selfUserId && m.receiver_id === otherUserId) ||
          (m.sender_id === otherUserId && m.receiver_id === selfUserId);
        return belongsHere && m.id && !loadedIds.has(m.id);
      });
      const merged = [...loaded, ...realtimeExtras].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return { messages: [...otherConvMsgs, ...merged] };
    }),
  addMessage: (message) =>
    set((state) => {
      // Deduplicate: skip if we already have a message with the same non-empty id
      if (message.id && state.messages.some((m) => m.id === message.id)) {
        return state;
      }
      // Also update conversation sidebar lastMessage
      const updatedConversations = state.conversations.map((conv) => {
        const isThisConv =
          conv.user.id === message.sender_id || conv.user.id === message.receiver_id;
        return isThisConv ? { ...conv, lastMessage: message } : conv;
      });
      return {
        messages: [...state.messages, message],
        conversations: updatedConversations,
      };
    }),

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
