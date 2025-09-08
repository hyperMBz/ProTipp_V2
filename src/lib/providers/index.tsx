"use client";

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { UnifiedAuthProvider } from '@/lib/auth/unified-auth-provider';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { BetTrackerProvider } from '@/components/bet-tracker/BetTrackerProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthErrorBoundary>
      <QueryProvider>
        <UnifiedAuthProvider>
          <BetTrackerProvider>
            {children}
          </BetTrackerProvider>
        </UnifiedAuthProvider>
      </QueryProvider>
    </AuthErrorBoundary>
  );
}
