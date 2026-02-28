'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeApplier } from '@/components/ThemeApplier';
import { queryClient } from '@/lib/api/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeApplier />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
