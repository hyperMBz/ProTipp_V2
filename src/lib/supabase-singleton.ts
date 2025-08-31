import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase/client';

// Singleton Supabase client to avoid multiple instances
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    console.log('🔧 Creating new Supabase client instance');
    
    // Ellenőrizzük a környezeti változókat
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables:');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
      console.warn('⚠️ Using fallback client with placeholder values');
      
      // Fallback kliens placeholder értékekkel
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl: 'https://placeholder.supabase.co',
        supabaseKey: 'placeholder-key',
      });
      
      return supabaseClient;
    }
    
    if (supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key-here') {
      console.error('❌ Supabase környezeti változók placeholder értékeket tartalmaznak.');
      console.error('Kérjük, frissítse a .env.local fájlt valós Supabase projekt adatokkal.');
      console.warn('⚠️ Using fallback client with placeholder values');
      
      // Fallback kliens placeholder értékekkel
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl: 'https://placeholder.supabase.co',
        supabaseKey: 'placeholder-key',
      });
      
      return supabaseClient;
    }
    
    try {
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl,
        supabaseKey: supabaseAnonKey,
      });
      
      console.log('✅ Supabase client created successfully');
    } catch (error) {
      console.error('❌ Error creating Supabase client:', error);
      console.warn('⚠️ Using fallback client');
      
      // Fallback kliens hiba esetén
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl: 'https://placeholder.supabase.co',
        supabaseKey: 'placeholder-key',
      });
    }
  }
  return supabaseClient;
}

// Force a new client instance (for debugging)
export function resetSupabaseClient() {
  console.log('🔄 Resetting Supabase client');
  supabaseClient = null;
  return getSupabaseClient();
}
