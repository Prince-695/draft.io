'use client';

import { useEffect } from 'react';
import { applyThemeById, THEME_STORAGE_KEY, DEFAULT_THEME_ID } from '@/hooks/useCustomTheme';

/**
 * Renders nothing — just applies the saved color-theme CSS vars on every
 * page load so the chosen theme is active site-wide without a flash.
 */
export function ThemeApplier() {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
    applyThemeById(stored);
  }, []);

  return null;
}
