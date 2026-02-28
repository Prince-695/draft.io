import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { Blog, ApiResponse } from '@/types';

type BlogListResponse = { blogs: Blog[]; count: number };

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
  getBlogs: async (page = 1, limit = 10): Promise<ApiResponse<BlogListResponse>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.BLOG.LIST}/feed`, {
      params: { limit, offset: (page - 1) * limit },
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
  searchBlogs: async (query: string, page = 1): Promise<ApiResponse<BlogListResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.BLOG.SEARCH, {
      params: { q: query, limit: 10, offset: (page - 1) * 10 },
    });
    return response.data;
  },

  // Get trending blogs
  getTrending: async (): Promise<ApiResponse<Blog[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RECOMMENDATIONS.TRENDING}?limit=10`);
    return response.data;
  },

  // Get personalised feed from recommendation service
  getRecommendedFeed: async (): Promise<ApiResponse<Blog[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RECOMMENDATIONS.FEED}?limit=20`);
    return response.data;
  },

  // Get my blogs (all statuses — requires auth)
  getMyBlogs: async (page = 1): Promise<ApiResponse<BlogListResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.BLOG.MY_BLOGS, {
      params: { limit: 20, offset: (page - 1) * 20 },
    });
    return response.data;
  },

  // Get published blogs by any user ID (public)
  getUserBlogs: async (userId: string, page = 1): Promise<ApiResponse<BlogListResponse>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.BLOG.USER_BLOGS}/${userId}`, {
      params: { limit: 20, offset: (page - 1) * 20 },
    });
    return response.data;
  },

  // Get a single blog by ID (works with UUID — for edit mode, returns drafts too)
  getBlogById: async (id: string): Promise<ApiResponse<Blog>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.BLOG.GET}/${id}`);
    return response.data;
  },
};
