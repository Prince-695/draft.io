'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores';

export function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded ${theme === 'light' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
        title="Light mode"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded ${theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
        title="Dark mode"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded ${theme === 'system' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
        title="System"
      >
        💻
      </button>
    </div>
  );
}
