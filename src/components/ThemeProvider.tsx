'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="data-theme" 
      defaultTheme="xp" 
      enableSystem={false}
      themes={['xp', 'darkside', 'glass']}
    >
      {children}
    </NextThemesProvider>
  );
}
