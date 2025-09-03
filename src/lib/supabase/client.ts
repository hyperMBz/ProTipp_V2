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
          mfa_enabled: boolean;
          mfa_type: 'totp' | 'sms' | 'email' | null;
          mfa_secret: string | null;
          mfa_backup_codes: string[] | null;
          last_mfa_used: string | null;
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
          mfa_enabled?: boolean;
          mfa_type?: 'totp' | 'sms' | 'email' | null;
          mfa_secret?: string | null;
          mfa_backup_codes?: string[] | null;
          last_mfa_used?: string | null;
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
          mfa_enabled?: boolean;
          mfa_type?: 'totp' | 'sms' | 'email' | null;
          mfa_secret?: string | null;
          mfa_backup_codes?: string[] | null;
          last_mfa_used?: string | null;
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
      // Security tables
      mfa_sessions: {
        Row: {
          id: string;
          user_id: string;
          mfa_type: 'totp' | 'sms' | 'email';
          verified: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mfa_type: 'totp' | 'sms' | 'email';
          verified?: boolean;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mfa_type?: 'totp' | 'sms' | 'email';
          verified?: boolean;
          expires_at?: string;
          created_at?: string;
        };
      };
      encryption_keys: {
        Row: {
          id: string;
          user_id: string;
          key_name: string;
          key_type: 'master' | 'session';
          encrypted_key: string;
          salt: string;
          iterations: number;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          key_name: string;
          key_type: 'master' | 'session';
          encrypted_key: string;
          salt: string;
          iterations: number;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          key_name?: string;
          key_type?: 'master' | 'session';
          encrypted_key?: string;
          salt?: string;
          iterations?: number;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          key_name: string;
          hashed_key: string;
          permissions: string[];
          active: boolean;
          last_used: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          key_name: string;
          hashed_key: string;
          permissions: string[];
          active?: boolean;
          last_used?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          key_name?: string;
          hashed_key?: string;
          permissions?: string[];
          active?: boolean;
          last_used?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      security_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          description: string;
          metadata: Record<string, unknown>;
          resolved: boolean;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          description: string;
          metadata?: Record<string, unknown>;
          resolved?: boolean;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          description?: string;
          metadata?: Record<string, unknown>;
          resolved?: boolean;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Record<string, unknown>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          details?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          details?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          ip_address: string;
          user_agent: string;
          last_activity: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          ip_address: string;
          user_agent: string;
          last_activity?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          ip_address?: string;
          user_agent?: string;
          last_activity?: string;
          expires_at?: string;
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

// Security helper functions
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
});

// Rate limiting helper
export const createRateLimitedClient = (maxRequests: number = 100, windowMs: number = 60000) => {
  const client = createSupabaseClient();
  let requestCount = 0;
  let windowStart = Date.now();

  return {
    ...client,
    // Custom rate limiting logic can be implemented here
    getRequestCount: () => requestCount,
    resetRequestCount: () => {
      requestCount = 0;
      windowStart = Date.now();
    }
  };
};

// Default export for easy importing
export default createSupabaseClient;
