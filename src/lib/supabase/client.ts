import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bankroll: number;
          timezone: string;
          currency: string;
          subscription_tier: 'free' | 'pro' | 'premium';
          subscription_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bankroll?: number;
          timezone?: string;
          currency?: string;
          subscription_tier?: 'free' | 'pro' | 'premium';
          subscription_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bankroll?: number;
          timezone?: string;
          currency?: string;
          subscription_tier?: 'free' | 'pro' | 'premium';
          subscription_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bet_history: {
        Row: {
          id: string;
          user_id: string;
          event_name: string;
          sport: string;
          bookmaker: string;
          odds: number;
          stake: number;
          outcome: string;
          status: 'pending' | 'won' | 'lost' | 'refunded' | 'cancelled';
          placed_at: string;
          settled_at: string | null;
          profit: number | null;
          clv: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_name: string;
          sport: string;
          bookmaker: string;
          odds: number;
          stake: number;
          outcome: string;
          status?: 'pending' | 'won' | 'lost' | 'refunded' | 'cancelled';
          placed_at: string;
          settled_at?: string | null;
          profit?: number | null;
          clv?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_name?: string;
          sport?: string;
          bookmaker?: string;
          odds?: number;
          stake?: number;
          outcome?: string;
          status?: 'pending' | 'won' | 'lost' | 'refunded' | 'cancelled';
          placed_at?: string;
          settled_at?: string | null;
          profit?: number | null;
          clv?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          auto_refresh: boolean;
          notification_settings: Record<string, unknown>;
          default_filters: Record<string, unknown>;
          dashboard_layout: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          auto_refresh?: boolean;
          notification_settings?: Record<string, unknown>;
          default_filters?: Record<string, unknown>;
          dashboard_layout?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          auto_refresh?: boolean;
          notification_settings?: Record<string, unknown>;
          default_filters?: Record<string, unknown>;
          dashboard_layout?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
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

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side Supabase client for admin operations
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Default export for easy importing
export default createSupabaseClient;
