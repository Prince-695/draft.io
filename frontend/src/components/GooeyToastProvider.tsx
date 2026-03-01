'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function GooeyToastProvider() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-center"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      duration={5000}
      closeButton
      richColors
      toastOptions={{
        style: { borderRadius: '6px' },
      }}
    />
  );
}
