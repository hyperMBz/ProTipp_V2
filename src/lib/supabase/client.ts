import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Database típus definíció
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          subscription_tier: 'free' | 'pro' | 'premium';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          subscription_tier?: 'free' | 'pro' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          subscription_tier?: 'free' | 'pro' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          bookmaker: string;
          bet_type: string;
          odds: number;
          stake: number;
          status: 'pending' | 'won' | 'lost' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          bookmaker: string;
          bet_type: string;
          odds: number;
          stake: number;
          status?: 'pending' | 'won' | 'lost' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          bookmaker?: string;
          bet_type?: string;
          odds?: number;
          stake?: number;
          status?: 'pending' | 'won' | 'lost' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      bet_history: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          bookmaker: string;
          bet_type: string;
          odds: number;
          stake: number;
          potential_return: number;
          status: 'pending' | 'won' | 'lost' | 'cancelled';
          profit_loss: number | null;
          created_at: string;
          updated_at: string;
          // További mezők, amiket a kód használ
          event_name?: string;
          sport?: string;
          outcome?: string;
          profit?: number;
          clv?: number;
          placed_at?: string;
          notes?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          bookmaker: string;
          bet_type: string;
          odds: number;
          stake: number;
          potential_return: number;
          status?: 'pending' | 'won' | 'lost' | 'cancelled';
          profit_loss?: number | null;
          created_at?: string;
          updated_at?: string;
          // További mezők
          event_name?: string;
          sport?: string;
          outcome?: string;
          profit?: number;
          clv?: number;
          placed_at?: string;
          notes?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          bookmaker?: string;
          bet_type?: string;
          odds?: number;
          stake?: number;
          potential_return?: number;
          status?: 'pending' | 'won' | 'lost' | 'cancelled';
          profit_loss?: number | null;
          created_at?: string;
          updated_at?: string;
          // További mezők
          event_name?: string;
          sport?: string;
          outcome?: string;
          profit?: number;
          clv?: number;
          placed_at?: string;
          notes?: string;
        };
      };
      sports: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      bookmakers: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Client-side Supabase client using SSR package
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client for admin operations
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Server-side Supabase client for server components
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Security helper functions
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

// Auth helper functions
export const isAuthenticated = async (supabase: any) => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const getCurrentUser = async (supabase: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};