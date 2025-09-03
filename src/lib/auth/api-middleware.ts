/**
 * API Middleware Utilities
 * Server-side API route protection és authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/client';
import type { UserSession, UserRole } from './route-guard';
import { hasApiPermission } from './permission-checker';
import { checkRateLimit } from './session-manager';

export interface ApiAuthResult {
  success: boolean;
  user: UserSession | null;
  error?: string;
  statusCode?: number;
}

/**
 * API Route Authentication Wrapper
 * Automatikusan ellenőrzi a felhasználó hitelesítését
 */
export function withAuth(
  handler: (request: NextRequest, user: UserSession) => Promise<NextResponse>,
  options: {
    requiredRole?: UserRole;
    requiredPermission?: { action: string; resource: string };
    rateLimit?: { maxRequests: number; windowMs: number };
  } = {}
) {
  return async function authenticatedHandler(request: NextRequest): Promise<NextResponse> {
    try {
      // Rate limiting ellenőrzés
      if (options.rateLimit) {
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = checkRateLimit(
          clientIP,
          options.rateLimit.maxRequests,
          options.rateLimit.windowMs
        );
        
        if (!rateLimit.allowed) {
          return NextResponse.json(
            { error: 'Too many requests' },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimit.resetTime.toString(),
              }
            }
          );
        }
      }

      // Authentication ellenőrzés
      const authResult = await authenticateApiRequest(request);
      
      if (!authResult.success || !authResult.user) {
        return NextResponse.json(
          { error: authResult.error || 'Authentication required' },
          { status: authResult.statusCode || 401 }
        );
      }

      // Role ellenőrzés
      if (options.requiredRole && !hasRequiredRole(authResult.user, options.requiredRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Permission ellenőrzés
      if (options.requiredPermission) {
        if (!hasApiPermission(
          authResult.user,
          request.method,
          new URL(request.url).pathname
        )) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Handler meghívása hitelesített felhasználóval
      return await handler(request, authResult.user);
      
    } catch (error) {
      console.error('API middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Admin Route Protection
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: UserSession) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'admin' });
}

/**
 * Premium Route Protection
 */
export function withPremiumAuth(
  handler: (request: NextRequest, user: UserSession) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'premium' });
}

/**
 * User Route Protection
 */
export function withUserAuth(
  handler: (request: NextRequest, user: UserSession) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'user' });
}

/**
 * API Request Authentication
 */
export async function authenticateApiRequest(request: NextRequest): Promise<ApiAuthResult> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    // Session lekérése
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API auth session error:', sessionError);
      return {
        success: false,
        user: null,
        error: 'Authentication failed',
        statusCode: 401,
      };
    }
    
    if (!session?.user) {
      return {
        success: false,
        user: null,
        error: 'No active session',
        statusCode: 401,
      };
    }
    
    // Felhasználó profil lekérése
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_ends_at')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.warn('Profile fetch error in API auth:', profileError);
      // Folytatjuk alapértelmezett értékekkel
    }
    
    const userSession: UserSession = {
      id: session.user.id,
      email: session.user.email || '',
      role: determineUserRole(profile, session.user.email || ''),
      subscription_tier: profile?.subscription_tier || 'free',
      subscription_ends_at: profile?.subscription_ends_at || undefined,
    };
    
    return {
      success: true,
      user: userSession,
    };
    
  } catch (error) {
    console.error('API authentication error:', error);
    return {
      success: false,
      user: null,
      error: 'Authentication failed',
      statusCode: 500,
    };
  }
}

/**
 * Optional Authentication - nem kötelező auth
 */
export async function optionalAuth(request: NextRequest): Promise<UserSession | null> {
  const authResult = await authenticateApiRequest(request);
  return authResult.success ? authResult.user : null;
}

/**
 * API Error Response Helper
 */
export function apiError(
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * API Success Response Helper
 */
export function apiSuccess<T>(
  data: T,
  statusCode: number = 200,
  meta?: any
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Validation Helper
 */
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { isValid: boolean; missing?: string[] } {
  if (!body || typeof body !== 'object') {
    return { isValid: false };
  }
  
  const missing = requiredFields.filter(field => !body[field]);
  
  if (missing.length > 0) {
    return { isValid: false, missing: missing as string[] };
  }
  
  return { isValid: true };
}

/**
 * Query Parameter Helper
 */
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  return {
    get: (key: string) => searchParams.get(key),
    getInt: (key: string, defaultValue?: number) => {
      const value = searchParams.get(key);
      const parsed = value ? parseInt(value, 10) : defaultValue;
      return isNaN(parsed as number) ? defaultValue : parsed;
    },
    getFloat: (key: string, defaultValue?: number) => {
      const value = searchParams.get(key);
      const parsed = value ? parseFloat(value) : defaultValue;
      return isNaN(parsed as number) ? defaultValue : parsed;
    },
    getBoolean: (key: string, defaultValue?: boolean) => {
      const value = searchParams.get(key);
      if (value === null) return defaultValue;
      return value.toLowerCase() === 'true';
    },
    getArray: (key: string) => {
      const value = searchParams.get(key);
      return value ? value.split(',').map(s => s.trim()) : [];
    },
  };
}

/**
 * Helper functions
 */
function determineUserRole(profile: any, email: string): UserRole {
  if (email.endsWith('@protipp.admin')) {
    return 'admin';
  }
  
  if (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro') {
    if (profile.subscription_ends_at) {
      const expiryDate = new Date(profile.subscription_ends_at);
      if (expiryDate > new Date()) {
        return 'premium';
      }
    }
  }
  
  return 'user';
}

function hasRequiredRole(user: UserSession, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'public': 0,
    'user': 1,
    'premium': 2,
    'admin': 3,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}
