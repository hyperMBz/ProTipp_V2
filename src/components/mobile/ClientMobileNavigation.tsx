"use client";

import { useState, useEffect } from 'react';
import { MobileNavigation } from './MobileNavigation';
import { useAuth } from '@/lib/auth/unified-auth-provider';

interface ClientMobileNavigationProps {
  className?: string;
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

export function ClientMobileNavigation({ 
  className, 
  onNavigate, 
  currentRoute 
}: ClientMobileNavigationProps) {
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

  return (
    <MobileNavigation 
      className={className}
      onNavigate={onNavigate}
      currentRoute={currentRoute}
    />
  );
}
