import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/utils/constants';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { tokens } = useAuthStore.getState();
    
    if (tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    // Instantly update the AI usage counter whenever a backend AI call returns quota headers.
    // The gateway exposes these via Access-Control-Expose-Headers so the browser can read them.
    const used = response.headers['x-ai-requests-used'];
    const limit = response.headers['x-ai-requests-limit'];
    if (used !== undefined && limit !== undefined) {
      useUIStore.getState().setAIUsage(parseInt(used, 10), parseInt(limit, 10));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip token refresh for auth endpoints (login/register 401 = wrong credentials)
    const requestUrl = originalRequest.url ?? '';
    const isAuthEndpoint = requestUrl.includes('/api/auth/login') || 
      requestUrl.includes('/api/auth/register') ||
      requestUrl.includes('/api/auth/refresh');

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { tokens } = useAuthStore.getState();
        
        if (!tokens?.refreshToken) {
          // No refresh token, logout user
          useAuthStore.getState().logout();
          window.location.href = '/sign-in';
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: tokens.refreshToken,
        });

        const rawTokens = response.data?.data ?? response.data;
        // Preserve the existing refresh token if the server doesn't return a new one
        const existingTokens = useAuthStore.getState().tokens;
        const newTokens = {
          accessToken: rawTokens.accessToken ?? rawTokens.access_token ?? '',
          refreshToken: rawTokens.refreshToken ?? rawTokens.refresh_token ?? existingTokens?.refreshToken ?? '',
        };
        
        // Update tokens in store
        useAuthStore.getState().setTokens(newTokens);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
