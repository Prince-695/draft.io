'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { authApi } from '@/lib/api/auth';
import { ROUTES } from '@/utils/constants';
import type { User } from '@/types';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    async function handleCallback() {
      if (error || !token) {
        router.push(`${ROUTES.SIGN_IN}?error=oauth_failed`);
        return;
      }

      // Temporarily set the access token so the /me call is authenticated
      useAuthStore.setState((state) => ({
        ...state,
        tokens: { accessToken: token, refreshToken: '' },
      }));

      try {
        const res = await authApi.me();
        const user: User | undefined = res?.data;
        if (!user?.id) throw new Error('No user data');
        login(user, { accessToken: token, refreshToken: '' });
        router.replace(ROUTES.DASHBOARD);
      } catch {
        useAuthStore.setState((state) => ({ ...state, tokens: null }));
        router.push(`${ROUTES.SIGN_IN}?error=oauth_failed`);
      }
    }

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <LoadingSpinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
