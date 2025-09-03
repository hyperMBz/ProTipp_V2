"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-singleton';

// Auth context type definition
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
  verifyMFA: (code: string, type: 'totp' | 'sms' | 'email') => Promise<{ error: AuthError | null }>;
  setupMFA: (type: 'totp' | 'sms' | 'email') => Promise<{ error: AuthError | null }>;
  disableMFA: () => Promise<{ error: AuthError | null }>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const router = useRouter();

  const supabase = getSupabaseClient();

  const ensureUserProfile = useCallback(async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, mfa_enabled, mfa_type')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile does not exist, so create it
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.email, // Default to email
          mfa_enabled: false,
          mfa_type: null,
          updated_at: new Date().toISOString(),
        });
        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      } else if (error) {
        console.error("Error fetching profile:", error);
      } else if (data?.mfa_enabled) {
        setMfaRequired(true);
        setMfaVerified(false);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error getting initial session:', error);
      } else {
        console.log('✅ Initial session found:', session?.user?.email || 'No session');
        setSession(session);
        setUser(session?.user ?? null);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 User signed in, ensuring profile exists');
          // Update user profile or create if doesn't exist
          await ensureUserProfile(session.user);
          
          // Check if MFA is required
          if (mfaRequired && !mfaVerified) {
            router.push('/auth/mfa-verify');
          } else {
            // Refresh the router to update server components
            router.refresh();
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          // Refresh the router to update server components
          router.refresh();
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, ensureUserProfile, router]);

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata: Record<string, unknown> = {}) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    return { error };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔐 Attempting sign in for:', email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // Ha placeholder értékek vannak, adjunk egy informatív hibaüzenetet
        if (error.message.includes('fetch') || error.message.includes('network')) {
          setLoading(false);
          return { 
            error: {
              ...error,
              message: 'Supabase kapcsolat nincs beállítva. Kérjük, kövesse a SUPABASE_SETUP.md útmutatót.'
            } as AuthError 
          };
        }
        
        setLoading(false);
        return { error };
      }

      console.log('✅ Sign in successful');
      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected error during sign in:', error);
      setLoading(false);
      
      // Ha placeholder értékek vannak, adjunk egy informatív hibaüzenetet
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
        return { 
          error: {
            name: 'AuthError',
            message: 'Supabase kapcsolat nincs beállítva. Kérjük, kövesse a SUPABASE_SETUP.md útmutatót.',
            status: 500
          } as AuthError 
        };
      }
      
      return { error: error as AuthError };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    return { error };
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    setLoading(false);
    return { error };
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    return { error };
  };

  // Update user profile
  const updateProfile = async (data: Record<string, unknown>) => {
    if (!user) {
      return { error: new Error('No user found') as AuthError };
    }

    setLoading(true);

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data,
    });

    if (authError) {
      setLoading(false);
      return { error: authError };
    }

    // Update profile in database
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setLoading(false);
    return { error: profileError ? (profileError as unknown as AuthError) : null };
  };

  // MFA functions
  const verifyMFA = async (code: string, type: 'totp' | 'sms' | 'email') => {
    if (!user) {
      return { error: new Error('No user found') as AuthError };
    }

    try {
      // Verify MFA code using the MFA manager
      const { mfaManager } = await import('@/lib/security/mfa-manager');
      await mfaManager.verifyMFA({ user_id: user.id, mfa_type: type, code });
      
      setMfaVerified(true);
      setMfaRequired(false);
      
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const setupMFA = async (type: 'totp' | 'sms' | 'email') => {
    if (!user) {
      return { error: new Error('No user found') as AuthError };
    }

    try {
      // Setup MFA using the MFA manager
      const { mfaManager } = await import('@/lib/security/mfa-manager');
      if (type === 'totp') {
        await mfaManager.setupTOTP(user.id);
      } else if (type === 'sms') {
        await mfaManager.setupSMS(user.id, user.phone || '');
      } else if (type === 'email') {
        await mfaManager.setupEmail(user.id, user.email || '');
      }
      
      setMfaRequired(true);
      setMfaVerified(false);
      
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const disableMFA = async () => {
    if (!user) {
      return { error: new Error('No user found') as AuthError };
    }

    try {
      // Disable MFA using the MFA manager
      const { mfaManager } = await import('@/lib/security/mfa-manager');
      await mfaManager.deleteMFASession(user.id, 'totp');
      
      setMfaRequired(false);
      setMfaVerified(false);
      
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    mfaRequired,
    mfaVerified,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    verifyMFA,
    setupMFA,
    disableMFA,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Helper hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}

export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}
