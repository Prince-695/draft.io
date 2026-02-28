'use client';

import { useEffect } from 'react';
import { mountToaster } from 'gooey-toast';
import 'gooey-toast/styles.css';

export function GooeyToastProvider() {
  useEffect(() => {
    mountToaster({ position: 'top-center' });
  }, []);

  return null;
}
