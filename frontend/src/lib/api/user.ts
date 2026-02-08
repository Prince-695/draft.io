import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { User, ApiResponse } from '@/types';

export const userApi = {
  // Get user profile
  getProfile: async (username: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USER.PROFILE}/${username}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload cover image
  uploadCover: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await apiClient.post(API_ENDPOINTS.USER.UPLOAD_COVER, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.SEARCH, {
      params: { q: query },
    });
    return response.data;
  },

  // Follow user
  follow: async (userId: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`${API_ENDPOINTS.USER.FOLLOW}/${userId}`);
    return response.data;
  },

  // Unfollow user
  unfollow: async (userId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.USER.UNFOLLOW}/${userId}`);
    return response.data;
  },

  // Get followers
  getFollowers: async (userId: string): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USER.FOLLOWERS}/${userId}`);
    return response.data;
  },

  // Get following
  getFollowing: async (userId: string): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USER.FOLLOWING}/${userId}`);
    return response.data;
  },
};
