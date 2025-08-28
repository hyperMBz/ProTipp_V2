"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-singleton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing...');
  const [currentSession, setCurrentSession] = useState<any>(null);

  const supabase = getSupabaseClient();

  const testConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...');

      // Test 1: Check if we can get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📋 Current session:', session?.user?.email || 'No session');

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setConnectionStatus(`Session Error: ${sessionError.message}`);
        return;
      }

      setCurrentSession(session);

      // Test 2: Try to query a simple table (this will fail if database isn't set up)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (profileError) {
        console.error('❌ Database error:', profileError);
        setConnectionStatus(`Database Error: ${profileError.message}`);
        return;
      }

      console.log('✅ Supabase connection working!');
      setConnectionStatus('✅ Connected successfully!');

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setConnectionStatus(`Error: ${error}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-500/50 bg-blue-50/10">
      <CardHeader>
        <CardTitle className="text-sm text-blue-600">🧪 Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div><strong>Status:</strong> {connectionStatus}</div>
        <div><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</div>
        <div><strong>Current Session:</strong> {currentSession?.user?.email || 'No session'}</div>
        <Button size="sm" onClick={testConnection} className="mt-2">
          Test Again
        </Button>
      </CardContent>
    </Card>
  );
}
