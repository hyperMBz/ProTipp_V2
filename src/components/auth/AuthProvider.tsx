"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// User session interface
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Auth context interface
interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isLoginDialogOpen: boolean;
  setIsLoginDialogOpen: (open: boolean) => void;
  loginDialogMode: 'login' | 'register';
  setLoginDialogMode: (mode: 'login' | 'register') => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginDialogMode, setLoginDialogMode] = useState<'login' | 'register'>('login');
  
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Initialize auth state
  // Build user session object
  const buildUserSession = async (authUser: User): Promise<UserSession> => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError);
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        name: profile?.name || authUser.user_metadata?.name || '',
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error building user session:', err);
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || '',
        avatar_url: authUser.user_metadata?.avatar_url || '',
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  };

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

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state changed:', event);
        
        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            console.log('🚪 User signed out');
            setUser(null);
            setError(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('✅ User signed in or token refreshed');
            console.log('👤 User ID:', session.user.id);
            
            const userSession = await buildUserSession(session.user);
            setUser(userSession);
            setError(null);
            
            // Redirect to dashboard after sign in
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
  }, [buildUserSession, router, supabase.auth]);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setAuthError(null);
    
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        setAuthError(error.message);
        return false;
      }
      
      if (data.user) {
        console.log('✅ Sign in successful for user:', data.user.id);
        setAuthError(null);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('❌ Sign in failed:', err);
      setAuthError(err instanceof Error ? err.message : 'Sign in failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setAuthError(null);
    
    try {
      console.log('📝 Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        setAuthError(error.message);
        return false;
      }
      
      if (data.user) {
        console.log('✅ Sign up successful for user:', data.user.id);
        setAuthError(null);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('❌ Sign up failed:', err);
      setAuthError(err instanceof Error ? err.message : 'Sign up failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        setError(error.message);
      } else {
        setUser(null);
        setError(null);
        console.log('✅ User signed out successfully');
        router.push('/');
      }
    } catch (err) {
      console.error('❌ Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    authError,
    signIn,
    signUp,
    signOut,
    isLoginDialogOpen,
    setIsLoginDialogOpen,
    loginDialogMode,
    setLoginDialogMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}