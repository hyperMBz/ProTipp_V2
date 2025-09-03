/**
 * Authentication Hooks
 * React hook-ok authentication és authorization kezeléshez
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserSession, UserRole } from '@/lib/auth/route-guard';
import { hasPermission, hasRolePermission } from '@/lib/auth/permission-checker';

interface AuthState {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (action: string, resource: string, conditions?: Record<string, any>) => boolean;
  hasRole: (role: UserRole) => boolean;
  isSubscribed: (tier: 'free' | 'pro' | 'premium') => boolean;
}

type UseAuthReturn = AuthState & AuthActions;

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Session inicializálás és figyelés
  useEffect(() => {
    let mounted = true;

    // Jelenlegi session lekérése
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Initial session error:', error);
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }
        
        if (session?.user) {
          const userSession = await buildUserSession(session.user);
          setState(prev => ({ ...prev, user: userSession, loading: false, error: null }));
        } else {
          setState(prev => ({ ...prev, user: null, loading: false, error: null }));
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Session initialization failed:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Session initialization failed',
          loading: false 
        }));
      }
    };

    getInitialSession();

    // Auth state változások figyelése
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setState(prev => ({ ...prev, user: null, loading: false, error: null }));
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const userSession = await buildUserSession(session.user);
            setState(prev => ({ ...prev, user: userSession, loading: false, error: null }));
          } catch (error) {
            console.error('User session build failed:', error);
            setState(prev => ({ 
              ...prev, 
              error: error instanceof Error ? error.message : 'Failed to build user session',
              loading: false 
            }));
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // UserSession objektum építése
  const buildUserSession = async (user: any): Promise<UserSession> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_ends_at')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        // Alapértelmezett értékekkel folytatjuk
      }
      
      return {
        id: user.id,
        email: user.email || '',
        role: determineUserRole(profile, user.email || ''),
        subscription_tier: profile?.subscription_tier || 'free',
        subscription_ends_at: profile?.subscription_ends_at || undefined,
      };
    } catch (error) {
      console.error('Build user session error:', error);
      // Minimális user session alapértelmezett értékekkel
      return {
        id: user.id,
        email: user.email || '',
        role: 'user',
        subscription_tier: 'free',
      };
    }
  };

  // Bejelentkezés
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return false;
      }
      
      if (data.user) {
        const userSession = await buildUserSession(data.user);
        setState(prev => ({ ...prev, user: userSession, loading: false, error: null }));
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return false;
    }
  }, [supabase]);

  // Regisztráció
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    fullName?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return false;
      }
      
      // Regisztráció után általában email megerősítés szükséges
      setState(prev => ({ ...prev, loading: false, error: null }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return false;
    }
  }, [supabase]);

  // Kijelentkezés
  const signOut = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      setState(prev => ({ ...prev, user: null, loading: false, error: null }));
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase, router]);

  // Session frissítés
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return;
      }
      
      if (session?.user) {
        const userSession = await buildUserSession(session.user);
        setState(prev => ({ ...prev, user: userSession }));
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }, [supabase]);

  // Permission ellenőrzés
  const checkPermission = useCallback((
    action: string, 
    resource: string, 
    conditions?: Record<string, any>
  ): boolean => {
    return hasPermission(state.user, action, resource, conditions);
  }, [state.user]);

  // Role ellenőrzés
  const checkRole = useCallback((role: UserRole): boolean => {
    if (!state.user) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      'public': 0,
      'user': 1,
      'premium': 2,
      'admin': 3,
    };
    
    const userLevel = roleHierarchy[state.user.role] || 0;
    const requiredLevel = roleHierarchy[role] || 0;
    
    return userLevel >= requiredLevel;
  }, [state.user]);

  // Subscription ellenőrzés
  const checkSubscription = useCallback((tier: 'free' | 'pro' | 'premium'): boolean => {
    if (!state.user) return false;
    
    const tierHierarchy = {
      'free': 0,
      'pro': 1,
      'premium': 2,
    };
    
    const userTier = tierHierarchy[state.user.subscription_tier] || 0;
    const requiredTier = tierHierarchy[tier] || 0;
    
    // Lejárat ellenőrzés
    if (state.user.subscription_ends_at) {
      const expiryDate = new Date(state.user.subscription_ends_at);
      if (expiryDate < new Date()) {
        return tier === 'free'; // Lejárt subscription esetén csak free tier
      }
    }
    
    return userTier >= requiredTier;
  }, [state.user]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession,
    hasPermission: checkPermission,
    hasRole: checkRole,
    isSubscribed: checkSubscription,
  };
}

/**
 * Role-based component rendering hook
 */
export function useRoleGuard(requiredRole: UserRole) {
  const { user, loading } = useAuth();
  
  const hasAccess = user ? hasRolePermission(user.role, 'read', 'protected_content') : false;
  
  return {
    hasAccess: hasAccess && user ? user.role === requiredRole || user.role === 'admin' : false,
    loading,
    user,
  };
}

/**
 * Permission-based hook
 */
export function usePermission(action: string, resource: string) {
  const { user, loading } = useAuth();
  
  return {
    hasPermission: hasPermission(user, action, resource),
    loading,
    user,
  };
}

/**
 * Helper function - user role meghatározás
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
