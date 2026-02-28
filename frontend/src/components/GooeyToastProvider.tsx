'use client';

import { useEffect } from 'react';
import { mountToaster } from 'gooey-toast';
import 'gooey-toast/styles.css';

export function GooeyToastProvider() {
  useEffect(() => {
    mountToaster({
      position: 'top-center',
      options: {
        // Auto-dismiss after 5 s (was library default ~10 s)
        duration: 5000,
      },
    });
  }, []);

  return null;
}
