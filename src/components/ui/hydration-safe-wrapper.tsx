"use client";

import { useEffect, useState } from 'react';

/**
 * Hydration-safe wrapper komponens
 * Biztosítja, hogy a komponens csak a kliens oldalon renderelődjön
 * Elkerüli a hydration mismatch hibákat
 */
interface HydrationSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function HydrationSafeWrapper({ 
  children, 
  fallback = null, 
  className 
}: HydrationSafeWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Hydration-safe wrapper komponens táblázatokhoz
 * Speciális fallback táblázat struktúrával
 */
interface HydrationSafeTableWrapperProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

export function HydrationSafeTableWrapper({ 
  children, 
  className,
  columns = 1
}: HydrationSafeTableWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-2">
                {Array.from({ length: columns }).map((_, j) => (
                  <div key={j} className="h-4 bg-muted rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
