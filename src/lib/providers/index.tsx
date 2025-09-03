"use client";

import { ReactNode, useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { AuthProvider as NewAuthProvider } from '@/components/auth/AuthProvider';
import { AuthErrorBoundary, setupGlobalErrorHandler } from '@/components/auth/AuthErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Global error handler beállítása
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  return (
    <AuthErrorBoundary>
      <QueryProvider>
        <NewAuthProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NewAuthProvider>
      </QueryProvider>
    </AuthErrorBoundary>
  );
}
