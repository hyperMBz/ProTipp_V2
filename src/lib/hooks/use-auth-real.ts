/**
 * Authentication Hook - Sprint 9-10: Analytics Dashboard
 * Valódi Supabase Auth integrációval
 */

import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase/client';

const supabase = createSupabaseClient();

interface UseAuthOptions {
  redirectTo?: string;
}

interface AuthResult {
  error: string | null;
}

export function useAuth({ redirectTo }: UseAuthOptions = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Handle redirects
        if (redirectTo && event === 'SIGNED_IN') {
          window.location.href = redirectTo;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [redirectTo]);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error: 'Váratlan hiba történt a bejelentkezés során' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error: 'Váratlan hiba történt a regisztráció során' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      return { error: 'Váratlan hiba történt a kijelentkezés során' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset exception:', error);
      return { error: 'Váratlan hiba történt a jelszó visszaállítás során' };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Password update exception:', error);
      return { error: 'Váratlan hiba történt a jelszó frissítése során' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: { email?: string; data?: any }): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        console.error('Profile update error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { error: 'Váratlan hiba történt a profil frissítése során' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  };
}

/**
 * Convert Supabase auth errors to user-friendly Hungarian messages
 */
function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Hibás bejelentkezési adatok',
    'Email not confirmed': 'Az email cím nincs megerősítve',
    'User already registered': 'Ez az email cím már regisztrálva van',
    'Password should be at least 6 characters': 'A jelszónak legalább 6 karakter hosszúnak kell lennie',
    'Invalid email': 'Érvénytelen email cím',
    'Signup is disabled': 'A regisztráció jelenleg le van tiltva',
    'Email rate limit exceeded': 'Túl sok email kérés, próbáld újra később',
    'Password reset request limit exceeded': 'Túl sok jelszó visszaállítási kérés, próbáld újra később'
  };

  return errorMessages[error.message] || error.message || 'Ismeretlen hiba történt';
}
