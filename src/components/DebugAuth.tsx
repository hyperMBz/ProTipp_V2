"use client";

import { useAuth, useUser } from '@/lib/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugAuth() {
  const user = useUser();
  const { loading, session } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-4 border-yellow-500/50 bg-yellow-50/10">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-600">🐛 Debug Auth State</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
        <div><strong>User:</strong> {user?.email || 'null'}</div>
        <div><strong>User ID:</strong> {user?.id || 'null'}</div>
        <div><strong>Session:</strong> {session ? 'exists' : 'null'}</div>
        <div><strong>User Metadata:</strong> {JSON.stringify(user?.user_metadata || {})}</div>
      </CardContent>
    </Card>
  );
}
