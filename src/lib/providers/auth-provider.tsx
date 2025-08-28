"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-singleton';

// Auth context type definition
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
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
  const router = useRouter();

  const supabase = getSupabaseClient();

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
          // Refresh the router to update server components
          router.refresh();
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
  }, [supabase]);

  // Ensure user profile exists in database
  const ensureUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  };

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    return { error };
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

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
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
