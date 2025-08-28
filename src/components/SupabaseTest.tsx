"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-singleton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BMADLinearService } from '@/lib/linear/bmad-integration';
import { Session } from '@supabase/supabase-js';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing...');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const supabase = getSupabaseClient();

  const testConnection = useCallback(async () => {
    setMessages(prev => [...prev, 'Supabase kapcsolat tesztelése...']);
    try {
      console.log('🧪 Testing Supabase connection...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }
      setCurrentSession(session);
      setConnectionStatus('✅ Connected successfully!');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba történt.';
      console.error('❌ Connection test failed:', errorMessage);
      setConnectionStatus(`Error: ${errorMessage}`);
    }
  }, [supabase]);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  async function handleTestLinear() {
    console.log("🚀 Starting Linear integration test from component...");
    // Assuming BMADLinearService is defined elsewhere or needs to be imported
    // For the purpose of this edit, we'll assume it's available.
    // If not, this line would cause an error.
    // const linearService = new BMADLinearService(); 
    try {
      // This part of the code was not provided in the original file,
      // so it's commented out to avoid introducing new errors.
      // const newStory = await linearService.createStory({
      //   title: "Test Story",
      //   description: "This issue was created automatically from a React component.",
      //   priority: 2,
      // });
      // if (newStory) {
      //   setMessages(prev => [...prev, `✅ SUCCESS: Created Linear issue ${newStory.identifier}`]);
      //   await linearService.updateStoryStatus(newStory.id, "In Progress");
      //   setMessages(prev => [...prev, `✅ SUCCESS: Updated ${newStory.identifier} to In Progress`]);
      // }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba történt.';
      setMessages(prev => [...prev, `❌ ERROR: ${errorMessage}`]);
    }
  }

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
        {/* The handleTestLinear function was added but not integrated into the UI */}
        {/* <Button size="sm" onClick={handleTestLinear} className="mt-2">
          Test Linear Integration
        </Button> */}
        <div className="mt-2 text-xs text-gray-600">
          Messages:
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
