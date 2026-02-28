'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service here (e.g. Sentry)
    console.error('Global error boundary caught:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-2">
          An unexpected error occurred. This has been logged and we'll look into it.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-destructive font-mono bg-destructive/10 rounded p-3 mb-6 text-left break-all">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button onClick={() => router.push(ROUTES.HOME)} className="gap-2">
            <Home className="w-4 h-4" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
