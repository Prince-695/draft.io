'use client';

import { useCallback, useEffect, useState } from 'react';
import themes from '@/lib/themes.json';

export type ThemeEntry = {
  name: string;
  id: string;
  light: Record<string, string>;
  dark: Record<string, string>;
};

export const THEME_STORAGE_KEY = 'draft-io-color-theme';
export const DEFAULT_THEME_ID = 'warm-ember';

export const allThemes: ThemeEntry[] = themes as ThemeEntry[];

function buildStyleText(theme: ThemeEntry): string {
  const lightVars = Object.entries(theme.light)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  const darkVars = Object.entries(theme.dark)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${lightVars}\n}\n.dark {\n${darkVars}\n}`;
}

export function applyThemeById(id: string) {
  if (typeof document === 'undefined') return;
  const theme = allThemes.find((t) => t.id === id) ?? allThemes[0];
  let el = document.getElementById('custom-theme') as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = 'custom-theme';
    document.head.appendChild(el);
  }
  el.textContent = buildStyleText(theme);
}

export function useCustomTheme() {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);

  // On mount: read from localStorage and apply
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
    setThemeId(stored);
    applyThemeById(stored);
  }, []);

  const setCustomTheme = useCallback((id: string) => {
    setThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    applyThemeById(id);
  }, []);

  const activeTheme = allThemes.find((t) => t.id === themeId) ?? allThemes[0];

  return { themeId, activeTheme, setCustomTheme, allThemes };
}
