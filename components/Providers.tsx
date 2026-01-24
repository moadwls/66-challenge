'use client';

import { ReactNode } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import Paywall from '@/components/Paywall';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <AppProvider>
          {children}
          <Paywall />
        </AppProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
