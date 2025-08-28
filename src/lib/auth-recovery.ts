import { getSupabaseClient } from './supabase-singleton';

// Function to manually refresh auth session
export async function refreshAuthSession() {
  const supabase = getSupabaseClient();

  try {
    console.log('🔄 Attempting to refresh auth session...');

    // First check if we have any session at all
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (!currentSession) {
      console.log('⚠️ No current session found to refresh - skipping refresh');
      return null;
    }

    // Only try to refresh if we have a session
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('❌ Session refresh error:', error);
      return null;
    }

    if (session) {
      console.log('✅ Session refreshed successfully:', session.user.email);
      return session;
    }

    console.log('⚠️ No session returned from refresh');
    return null;

  } catch (error) {
    console.error('❌ Session recovery failed:', error);
    return null;
  }
}

// Function to check if we have a valid session
export async function checkAuthSession() {
  const supabase = getSupabaseClient();

  try {
    console.log('🔍 Checking current session...');

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Session check error:', error);
      return null;
    }

    if (session) {
      console.log('✅ Valid session found:', session.user.email);
      return session;
    }

    console.log('⚠️ No valid session');
    return null;

  } catch (error) {
    console.error('❌ Session check failed:', error);
    return null;
  }
}
