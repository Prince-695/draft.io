import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { Blog, ApiResponse, PaginatedResponse } from '@/types';

interface CreateBlogData {
  title: string;
  content: string;
  cover_image_url?: string;
  tags?: string[];
  category?: string;
  status?: 'draft' | 'published';
}

export const blogApi = {
  // Get all blogs (with pagination)
  getBlogs: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Blog>>> => {
    const response = await apiClient.get(API_ENDPOINTS.BLOG.LIST, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get single blog by slug
  getBlog: async (slug: string): Promise<ApiResponse<Blog>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.BLOG.GET}/${slug}`);
    return response.data;
  },

  // Create new blog
  createBlog: async (data: CreateBlogData): Promise<ApiResponse<Blog>> => {
    const response = await apiClient.post(API_ENDPOINTS.BLOG.CREATE, data);
    return response.data;
  },

  // Update blog
  updateBlog: async (id: string, data: Partial<CreateBlogData>): Promise<ApiResponse<Blog>> => {
    const response = await apiClient.put(`${API_ENDPOINTS.BLOG.UPDATE}/${id}`, data);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.BLOG.DELETE}/${id}`);
    return response.data;
  },

  // Publish blog
  publishBlog: async (id: string): Promise<ApiResponse<Blog>> => {
    const response = await apiClient.post(`${API_ENDPOINTS.BLOG.PUBLISH}/${id}/publish`);
    return response.data;
  },

  // Search blogs
  searchBlogs: async (query: string, page = 1): Promise<ApiResponse<PaginatedResponse<Blog>>> => {
    const response = await apiClient.get(API_ENDPOINTS.BLOG.SEARCH, {
      params: { q: query, page },
    });
    return response.data;
  },

  // Get trending blogs
  getTrending: async (): Promise<ApiResponse<Blog[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.BLOG.TRENDING);
    return response.data;
  },

  // Get my blogs
  getMyBlogs: async (page = 1): Promise<ApiResponse<PaginatedResponse<Blog>>> => {
    const response = await apiClient.get(API_ENDPOINTS.BLOG.MY_BLOGS, {
      params: { page },
    });
    return response.data;
  },
};
