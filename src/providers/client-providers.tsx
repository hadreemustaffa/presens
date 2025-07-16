'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { Toaster } from '@/components/ui/sonner';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SWRConfig value={{ dedupingInterval: 60000 }}>
        {children}
        <Toaster />
      </SWRConfig>
    </ThemeProvider>
  );
}
