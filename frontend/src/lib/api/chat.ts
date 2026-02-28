import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { ApiResponse } from '@/types';

export interface BackendConversation {
  _id: string;
  participants: string[]; // [userId1, userId2]
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface BackendMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface BackendMessagesResponse {
  messages: BackendMessage[];
  total: number;
  hasMore: boolean;
}

export const chatApi = {
  /** Fetch the current user's conversation list */
  getConversations: async (): Promise<ApiResponse<BackendConversation[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS);
    return response.data;
  },

  /** Fetch paginated message history with another user */
  getMessages: async (
    userId: string,
    page = 1,
    limit = 50
  ): Promise<ApiResponse<BackendMessagesResponse>> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.CHAT.MESSAGES}/${userId}`,
      { params: { page, limit } }
    );
    return response.data;
  },
};
