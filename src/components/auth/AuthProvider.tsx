/**
 * Auth Provider Component
 * Authentication context és state management
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { UserSession } from '@/lib/auth/route-guard';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider - Authentication állapot kezelés az egész alkalmazásban
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createSupabaseClient();

  // Session inicializálás és auth state figyelés
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Jelenlegi session lekérése
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('Auth initialization error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          const userSession = await buildUserSession(session.user);
          if (mounted) {
            setUser(userSession);
            setError(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Auth initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setLoading(false);
      }
    };

    // Auth state változások figyelése
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state changed:', event);
        
        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            setError(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const userSession = await buildUserSession(session.user);
            setUser(userSession);
            setError(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err instanceof Error ? err.message : 'Authentication error');
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // UserSession objektum építése
  const buildUserSession = async (authUser: any): Promise<UserSession> => {
    try {
      // Felhasználó profil lekérése
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_ends_at')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.warn('Profile fetch error:', error);
        // Folytatjuk alapértelmezett értékekkel
      }
      
      const userSession: UserSession = {
        id: authUser.id,
        email: authUser.email || '',
        role: determineUserRole(profile, authUser.email || ''),
        subscription_tier: profile?.subscription_tier || 'free',
        subscription_ends_at: profile?.subscription_ends_at || undefined,
      };
      
      return userSession;
    } catch (err) {
      console.error('Build user session error:', err);
      // Fallback minimal session
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: 'user',
        subscription_tier: 'free',
      };
    }
  };

  // Session frissítés
  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setError(error.message);
        return;
      }
      
      if (session?.user) {
        const userSession = await buildUserSession(session.user);
        setUser(userSession);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Session refresh failed');
    } finally {
      setLoading(false);
    }
  };

  // Kijelentkezés
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError(error.message);
      } else {
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    refreshSession,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth Context Hook
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Helper function - user role meghatározás
 */
function determineUserRole(profile: any, email: string): 'user' | 'premium' | 'admin' {
  // Admin ellenőrzés
  if (email.endsWith('@protipp.admin')) {
    return 'admin';
  }
  
  // Premium subscription ellenőrzés
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

/**
 * Auth Loading Component - Global loading állapot kezeléshez
 */
export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  const { loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Alkalmazás betöltése...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

/**
 * Auth Error Boundary - Globális auth error kezelés
 */
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  const { error } = useAuthContext();
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Hitelesítési hiba</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Újrapróbálás
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
