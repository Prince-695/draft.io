import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { QUERY_KEYS } from '@/utils/constants';

// Get blogs with pagination
export function useBlogs(page = 1, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOGS, page, limit],
    queryFn: () => blogApi.getBlogs(page, limit),
  });
}

// Get single blog by slug
export function useBlog(slug: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOG, slug],
    queryFn: () => blogApi.getBlog(slug),
    enabled: !!slug,
  });
}

// Create blog
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogApi.createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
    },
  });
}

// Update blog
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogApi.updateBlog(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
    },
  });
}

// Delete blog
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
    },
  });
}

// Publish blog
export function usePublishBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.publishBlog(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOGS] });
    },
  });
}

// Search blogs
export function useSearchBlogs(query: string, page = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOGS, 'search', query, page],
    queryFn: () => blogApi.searchBlogs(query, page),
    enabled: !!query,
  });
}

// Get my own blogs (all statuses — requires auth)
export function useMyBlogs(page = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.BLOGS, 'mine', page],
    queryFn: () => blogApi.getMyBlogs(page),
    staleTime: 0, // always fresh so newly created blogs appear immediately
  });
}

// Get trending blogs
export function useTrendingBlogs() {
  return useQuery({
    queryKey: [QUERY_KEYS.TRENDING],
    queryFn: () => blogApi.getTrending(),
  });
}

// Get personalised recommended feed
export function useRecommendedFeed() {
  return useQuery({
    queryKey: [QUERY_KEYS.FEED, 'recommended'],
    queryFn: () => blogApi.getRecommendedFeed(),
    // Fall through gracefully if recommendation service is down
    retry: 1,
  });
}
