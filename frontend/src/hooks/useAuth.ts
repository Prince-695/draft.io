import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { QUERY_KEYS } from '@/utils/constants';
import type { LoginCredentials, RegisterData } from '@/types';

// Login hook
export function useLogin() {
  const { login: loginStore } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      if (response.data) {
        loginStore(response.data.user, response.data.tokens);
      }
    },
  });
}

// Register hook
export function useRegister() {
  const { login: loginStore } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      if (response.data) {
        loginStore(response.data.user, response.data.tokens);
      }
    },
  });
}

// Logout hook
export function useLogout() {
  const { logout: logoutStore } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
  });
}

// Get current user hook
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'me'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
  });
}
