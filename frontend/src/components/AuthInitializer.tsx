'use client';

/**
 * AuthInitializer
 *
 * Runs ONCE when the app first mounts. It validates the persisted session
 * (stored in localStorage by Zustand) against the server:
 *
 *   • If the user IS authenticated → call /api/auth/me to verify the access
 *     token is still valid and refresh the user object in the store.
 *   • If the token is invalid / expired (401) → clear the store so the user
 *     gets redirected to sign-in.
 *   • Either way, set isLoading = false so ProtectedRoute / PublicRoute
 *     can render/redirect without a flicker.
 *
 * Renders nothing — purely side-effect-only.
 */
import { useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores';

export function AuthInitializer() {
  const { isAuthenticated, setUser, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        try {
          const response = await authApi.me();
          if (response?.data) {
            setUser(response.data);
          }
        } catch (err: any) {
          // Only logout if the server explicitly says the token is invalid (401)
          // Do NOT logout on rate limits (429), server errors (5xx), or network issues
          const status = err?.response?.status;
          if (status === 401) {
            logout();
          }
          // For all other errors (429, 500, network down), keep the session alive
        }
      }
      // Always mark loading done so route guards can make a decision
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
