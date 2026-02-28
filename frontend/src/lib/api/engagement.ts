import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { ApiResponse, Comment } from '@/types';

interface CreateCommentData {
  content: string;
  parent_comment_id?: string;
}

export const engagementApi = {
  // Like a blog post
  likeBlog: async (blogId: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`${API_ENDPOINTS.ENGAGEMENT.LIKE}/${blogId}/like`);
    return response.data;
  },

  // Unlike a blog post
  unlikeBlog: async (blogId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ENGAGEMENT.UNLIKE}/${blogId}/like`);
    return response.data;
  },

  // Get comments for a blog post
  getComments: async (blogId: string): Promise<ApiResponse<Comment[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ENGAGEMENT.COMMENT}/${blogId}/comments`);
    return response.data;
  },

  // Create a comment on a blog post
  createComment: async (blogId: string, data: CreateCommentData): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ENGAGEMENT.COMMENT}/${blogId}/comments`,
      data
    );
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.ENGAGEMENT.COMMENT}/comments/${commentId}`
    );
    return response.data;
  },

  // Bookmark a blog post
  bookmarkBlog: async (blogId: string): Promise<ApiResponse> => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ENGAGEMENT.BOOKMARK}/${blogId}/bookmark`
    );
    return response.data;
  },

  // Remove bookmark from a blog post
  unbookmarkBlog: async (blogId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.ENGAGEMENT.BOOKMARK}/${blogId}/bookmark`
    );
    return response.data;
  },

  // Get user bookmarks
  getBookmarks: async (): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.ENGAGEMENT.BOOKMARKS);
    return response.data;
  },
};
