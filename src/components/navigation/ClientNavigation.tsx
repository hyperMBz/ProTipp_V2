"use client";

import { useState, useEffect } from 'react';
import { MainNavigation } from './MainNavigation';
import { useAuth } from '@/lib/auth/unified-auth-provider';

interface ClientNavigationProps {
  className?: string;
}

export function ClientNavigation({ className }: ClientNavigationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Szerver oldali renderelés során ne jelenjen meg semmi
  if (!isMounted) {
    return null;
  }

  // Ha loading állapotban van, ne jelenjen meg semmi
  if (loading) {
    return null;
  }

  // Ha nincs bejelentkezve, ne jelenjen meg a navigáció
  if (!user) {
    return null;
  }

  return <MainNavigation className={className} />;
}
