"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Felhasználói session típus
export interface UserSession {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  subscription_tier: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

// Auth context típus
interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

// Auth context létrehozása
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Egységes Auth Provider komponens
export function UnifiedAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Felhasználói session építése
  const buildUserSession = async (authUser: User): Promise<UserSession> => {
    try {
      // Profil lekérése az adatbázisból
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profil lekérési hiba:', profileError);
      }

      // Ha nincs profil, létrehozzuk
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || '',
            avatar_url: authUser.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Profil létrehozási hiba:', insertError);
        }
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        role: profile?.role || 'user',
        subscription_tier: profile?.subscription_tier || 'free',
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
        user_metadata: authUser.user_metadata,
      };
    } catch (error) {
      console.error('User session build error:', error);
      // Fallback session
      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || '',
        avatar_url: authUser.user_metadata?.avatar_url || null,
        role: 'user',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: authUser.user_metadata,
      };
    }
  };

  // Auth inicializálás
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Auth inicializálás...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Aktív session találva:', session.user.id);
          const userSession = await buildUserSession(session.user);
          if (mounted) {
            setUser(userSession);
            setError(null);
            console.log('✅ User beállítva:', userSession.id);
          }
        } else {
          console.log('⚠️ Nincs aktív session');
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
          console.log('✅ Auth inicializálás befejezve');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('❌ Auth inicializálás sikertelen:', err);
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
            console.log('🚪 User signed out');
            setUser(null);
            setError(null);
            // Kijelentkezés után a főoldalra irányítás
            router.push('/');
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('✅ User signed in or token refreshed');
            console.log('👤 User ID:', session.user.id);
            
            const userSession = await buildUserSession(session.user);
            setUser(userSession);
            setError(null);
            
            // Bejelentkezés után a dashboard-ra irányítás
            if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
              console.log('🔄 Redirecting to dashboard...');
              router.push('/dashboard');
            }
          }
        } catch (err) {
          console.error('❌ Auth state change error:', err);
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
  }, [router, supabase]);

  // Bejelentkezés
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        console.log('✅ Sign in successful for user:', data.user.id);
        setError(null);
        return { success: true };
      }
      
      return { success: false, error: 'Bejelentkezés sikertelen' };
    } catch (err) {
      console.error('❌ Sign in failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bejelentkezés sikertelen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Regisztráció
  const signUp = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        console.log('✅ Sign up successful for user:', data.user.id);
        setError(null);
        return { success: true };
      }
      
      return { success: false, error: 'Regisztráció sikertelen' };
    } catch (err) {
      console.error('❌ Sign up failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Regisztráció sikertelen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Google bejelentkezés
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Attempting Google sign in');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('❌ Google sign in error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Google sign in initiated');
      return { success: true };
    } catch (err) {
      console.error('❌ Google sign in failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Google bejelentkezés sikertelen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Kijelentkezés
  const signOut = async (): Promise<void> => {
    setLoading(true);
    
    try {
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        setError(error.message);
      } else {
        console.log('✅ Sign out successful');
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Kijelentkezés sikertelen');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}
