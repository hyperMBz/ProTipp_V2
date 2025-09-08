/**
 * Hydration-safe utility függvények
 * SSR és kliens oldali renderelés közötti konzisztencia biztosítása
 */

import { useMemo } from 'react';

/**
 * Hydration-safe string érték
 * Biztosítja, hogy a szerver és kliens oldalon ugyanazt az értéket adja vissza
 */
export function useHydrationSafeString(
  value: string | undefined | null,
  fallback: string = ''
): string {
  return useMemo(() => {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return fallback;
  }, [value, fallback]);
}

/**
 * Hydration-safe objektum mező elérés
 * Biztonságos mező elérés hydration során
 */
export function useHydrationSafeField<T>(
  obj: T | undefined | null,
  field: keyof T,
  fallback: string = ''
): string {
  return useMemo(() => {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }
    
    const value = obj[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    
    return fallback;
  }, [obj, field, fallback]);
}

/**
 * Hydration-safe szám érték
 * Biztosítja, hogy a számok konzisztensek legyenek
 */
export function useHydrationSafeNumber(
  value: number | undefined | null,
  fallback: number = 0
): number {
  return useMemo(() => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    return fallback;
  }, [value, fallback]);
}

/**
 * Hydration-safe boolean érték
 * Biztosítja, hogy a boolean értékek konzisztensek legyenek
 */
export function useHydrationSafeBoolean(
  value: boolean | undefined | null,
  fallback: boolean = false
): boolean {
  return useMemo(() => {
    if (typeof value === 'boolean') {
      return value;
    }
    return fallback;
  }, [value, fallback]);
}

/**
 * Hydration-safe objektum ellenőrzés
 * Ellenőrzi, hogy az objektum teljes és érvényes-e
 */
export function isHydrationSafeObject<T>(obj: T | undefined | null): obj is T {
  return obj !== null && obj !== undefined && typeof obj === 'object';
}

/**
 * Hydration-safe array ellenőrzés
 * Ellenőrzi, hogy az array érvényes-e
 */
export function isHydrationSafeArray<T>(arr: T[] | undefined | null): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Hydration-safe dátum formázás
 * Konzisztens dátum megjelenítés
 */
export function useHydrationSafeDate(
  date: Date | string | undefined | null,
  fallback: string = 'N/A'
): string {
  return useMemo(() => {
    if (!date) return fallback;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return fallback;
      
      return dateObj.toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fallback;
    }
  }, [date, fallback]);
}

/**
 * Hydration-safe százalék formázás
 * Konzisztens százalék megjelenítés
 */
export function useHydrationSafePercentage(
  value: number | undefined | null,
  fallback: string = '0%'
): string {
  return useMemo(() => {
    if (typeof value === 'number' && !isNaN(value)) {
      return `${value.toFixed(1)}%`;
    }
    return fallback;
  }, [value, fallback]);
}

/**
 * Hydration-safe pénz formázás
 * Konzisztens pénz megjelenítés
 */
export function useHydrationSafeCurrency(
  value: number | undefined | null,
  currency: string = 'HUF',
  fallback: string = '0 HUF'
): string {
  return useMemo(() => {
    if (typeof value === 'number' && !isNaN(value)) {
      return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }
    return fallback;
  }, [value, currency, fallback]);
}

/**
 * Hydration-safe szám formázás tizedesjegyekkel
 * Konzisztens szám megjelenítés
 */
export function safeToFixed(value: number | undefined | null, decimals: number = 2): string {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals);
  }
  return '0.00';
}

/**
 * Hydration-safe odds irány meghatározás
 * Stabil odds irány hydration során
 */
export function stableOddsDirection(odds: number, previousOdds?: number): 'up' | 'down' | 'stable' {
  if (typeof previousOdds !== 'number' || isNaN(previousOdds)) {
    return 'stable';
  }
  
  if (typeof odds !== 'number' || isNaN(odds)) {
    return 'stable';
  }
  
  if (odds > previousOdds) return 'up';
  if (odds < previousOdds) return 'down';
  return 'stable';
}

/**
 * Hydration-safe odds változás számítás
 * Stabil odds változás hydration során
 */
export function stableOddsChange(odds: number, previousOdds?: number): number {
  if (typeof previousOdds !== 'number' || isNaN(previousOdds)) {
    return 0;
  }
  
  if (typeof odds !== 'number' || isNaN(odds)) {
    return 0;
  }
  
  return odds - previousOdds;
}