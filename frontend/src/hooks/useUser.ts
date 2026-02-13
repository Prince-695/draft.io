import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { QUERY_KEYS } from '@/utils/constants';

// Get user profile
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, username],
    queryFn: () => userApi.getProfile(username),
    enabled: !!username,
  });
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
}

// Upload avatar
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
}

// Follow user
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
}

// Unfollow user
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
}

// Search users
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'search', query],
    queryFn: () => userApi.searchUsers(query),
    enabled: !!query && query.length > 2,
  });
}

// Get user's following list
export function useFollowing(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'following'],
    queryFn: () => userApi.getFollowing(userId),
    enabled: !!userId,
  });
}

// Get user's followers list
export function useFollowers(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, userId, 'followers'],
    queryFn: () => userApi.getFollowers(userId),
    enabled: !!userId,
  });
}
