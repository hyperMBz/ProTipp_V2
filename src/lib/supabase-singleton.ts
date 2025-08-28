import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase/client';

// Singleton Supabase client to avoid multiple instances
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    console.log('🔧 Creating new Supabase client instance');
    supabaseClient = createClientComponentClient<Database>();
  }
  return supabaseClient;
}

// Force a new client instance (for debugging)
export function resetSupabaseClient() {
  console.log('🔄 Resetting Supabase client');
  supabaseClient = null;
  return getSupabaseClient();
}
