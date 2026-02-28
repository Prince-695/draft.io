import apiClient from './client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { 
  LoginCredentials, 
  RegisterData, 
  User, 
  AuthTokens,
  ApiResponse 
} from '@/types';

// Helper to normalize backend snake_case token keys to camelCase
function normalizeTokens(tokens: Record<string, string>): import('@/types').AuthTokens {
  return {
    accessToken: tokens.accessToken ?? tokens.access_token ?? '',
    refreshToken: tokens.refreshToken ?? tokens.refresh_token ?? '',
  };
}

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    const res = response.data;
    if (res?.data?.tokens) res.data.tokens = normalizeTokens(res.data.tokens);
    return res;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const res = response.data;
    if (res?.data?.tokens) res.data.tokens = normalizeTokens(res.data.tokens);
    return res;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  // Get current user
  me: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
    const res = response.data;
    if (res?.data) res.data = normalizeTokens(res.data);
    return res;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`);
    return response.data;
  },

  // Google OAuth
  googleAuth: async (code: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, { code });
    return response.data;
  },
};
