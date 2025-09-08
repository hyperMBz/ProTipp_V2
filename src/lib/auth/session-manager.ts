/**
 * Session Manager Utilities
 * JWT token kezelés és session validáció
 */

import { createClient } from '@supabase/supabase-js';
import { UserSession, UserRole } from './route-guard';
import type { Database } from '@/lib/supabase/client';

export interface SessionValidationResult {
  isValid: boolean;
  user: UserSession | null;
  error?: string;
}

/**
 * Server-side session validáció
 */
export async function validateSession(): Promise<SessionValidationResult> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session validation error:', sessionError);
      return {
        isValid: false,
        user: null,
        error: sessionError.message,
      };
    }
    
    if (!session?.user) {
      return {
        isValid: false,
        user: null,
        error: 'No active session',
      };
    }
    
    // Felhasználó profil lekérése
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return {
        isValid: false,
        user: null,
        error: 'Failed to fetch user profile',
      };
    }
    
    // UserSession objektum összeállítása
    const userSession: UserSession = {
      id: session.user.id,
      email: session.user.email || (profile as any).email,
      role: determineUserRole(profile),
      subscription_tier: (profile as any).subscription_tier,
      subscription_ends_at: (profile as any).subscription_ends_at || undefined,
    };
    
    return {
      isValid: true,
      user: userSession,
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    return {
      isValid: false,
      user: null,
      error: 'Session validation failed',
    };
  }
}

/**
 * Felhasználó szerepkör meghatározása
 */
function determineUserRole(profile: any): UserRole {
  // Admin ellenőrzés (például email domain alapján)
  if (profile.email?.endsWith('@protipp.admin')) {
    return 'admin';
  }
  
  // Premium subscription ellenőrzés
  if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro') {
    // Ellenőrizzük hogy aktív-e
    if (profile.subscription_ends_at) {
      const expiryDate = new Date(profile.subscription_ends_at);
      if (expiryDate > new Date()) {
        return 'premium';
      }
    }
  }
  
  // Alapértelmezett user szerepkör
  return 'user';
}

/**
 * Token frissítés ellenőrzés
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Token refresh error:', error);
      return false;
    }
    
    return !!session;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Session invalidáció
 */
export async function invalidateSession(): Promise<boolean> {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Session invalidation error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session invalidation failed:', error);
    return false;
  }
}

/**
 * JWT token validáció (middleware számára)
 */
export async function validateJWTToken(token: string): Promise<SessionValidationResult> {
  try {
    // Token format ellenőrzés
    if (!token || typeof token !== 'string') {
      return {
        isValid: false,
        user: null,
        error: 'Invalid token format',
      };
    }
    
    // Token expiry ellenőrzés (ha JWT formátum)
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return {
              isValid: false,
              user: null,
              error: 'Token expired',
            };
          }
        }
      } catch (e) {
        // Ha nem JWT formátum, folytatjuk a Supabase validációval
      }
    }
    
    // Supabase JWT token dekódolás és validáció
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return {
        isValid: false,
        user: null,
        error: error?.message || 'Invalid token',
      };
    }
    
    // Profil lekérése
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return {
        isValid: false,
        user: null,
        error: 'Failed to fetch user profile',
      };
    }
    
    const userSession: UserSession = {
      id: user.id,
      email: user.email || (profile as any).email,
      role: determineUserRole(profile),
      subscription_tier: (profile as any).subscription_tier,
      subscription_ends_at: (profile as any).subscription_ends_at || undefined,
    };
    
    return {
      isValid: true,
      user: userSession,
    };
  } catch (error) {
    console.error('JWT validation failed:', error);
    return {
      isValid: false,
      user: null,
      error: 'JWT validation failed',
    };
  }
}

/**
 * Session timeout ellenőrzés
 */
export function isSessionExpired(session: any): boolean {
  if (!session?.expires_at) {
    return true;
  }
  
  const expiryTime = new Date(session.expires_at * 1000);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 perc buffer
  
  return expiryTime.getTime() - bufferTime < now.getTime();
}

/**
 * Cookie-ból session token kinyerése
 */
export function extractSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  
  for (const cookie of cookies) {
    if (cookie.startsWith('supabase-auth-token=')) {
      return cookie.split('=')[1];
    }
    // Alternatív cookie nevek
    if (cookie.startsWith('sb-access-token=')) {
      return cookie.split('=')[1];
    }
  }
  
  return null;
}

/**
 * Rate limiting session ellenőrzés
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number; windowStart: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 perc
  burstLimit: number = 10 // Burst protection
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  let record = rateLimitStore.get(identifier);
  
  if (!record || record.windowStart < windowStart) {
    record = { count: 0, resetTime: now + windowMs, windowStart: now };
    rateLimitStore.set(identifier, record);
  }
  
  // Burst protection
  if (record.count >= burstLimit && (now - record.windowStart) < 60000) { // 1 perc
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }
  
  record.count++;
  
  const allowed = record.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - record.count);
  
  return {
    allowed,
    remaining,
    resetTime: record.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((record.resetTime - now) / 1000)
  };
}

// Per-user rate limiting
export function checkUserRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 50,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const identifier = `user:${userId}:${action}`;
  return checkRateLimit(identifier, maxRequests, windowMs);
}

// Per-IP rate limiting
export function checkIPRateLimit(
  ip: string,
  maxRequests: number = 200,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const identifier = `ip:${ip}`;
  return checkRateLimit(identifier, maxRequests, windowMs);
}

/**
 * Security headers beállítása
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;",
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}
