"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.log('No session found, redirecting to home');
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        router.push('/?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Bejelentkezés feldolgozása...</h2>
        <p className="text-muted-foreground">
          Kérjük várjon, amíg átirányítjuk a dashboard-ra.
        </p>
      </div>
    </div>
  );
}
