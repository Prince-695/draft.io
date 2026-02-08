import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/utils/constants';
import type { Blog, ApiResponse, PaginatedResponse } from '@/types';

// Get paginated blogs
export function useBlogs(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOGS, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Blog>>>(
        `${API_ENDPOINTS.BLOG.LIST}?page=${page}&limit=${limit}`
      );
      return response.data.data!;
    },
  });
}

// Get single blog by slug
export function useBlog(slug: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOG, slug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Blog>>(
        `${API_ENDPOINTS.BLOG.GET}/${slug}`
      );
      return response.data.data!;
    },
    enabled: !!slug,
  });
}

// Create blog mutation
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Blog>) => {
      const response = await apiClient.post<ApiResponse<Blog>>(
        API_ENDPOINTS.BLOG.CREATE,
        data
      );
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
    },
  });
}

// Update blog mutation
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Blog> }) => {
      const response = await apiClient.put<ApiResponse<Blog>>(
        `${API_ENDPOINTS.BLOG.UPDATE}/${id}`,
        data
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG, data.slug] });
    },
  });
}

// Delete blog mutation
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.BLOG.DELETE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
    },
  });
}

// Search blogs
export function useSearchBlogs(query: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOGS, 'search', query],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Blog[]>>(
        `${API_ENDPOINTS.BLOG.SEARCH}?q=${query}`
      );
      return response.data.data!;
    },
    enabled: query.length > 2,
  });
}
