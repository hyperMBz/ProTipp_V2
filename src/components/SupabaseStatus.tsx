"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-singleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<{
    url: string | undefined;
    key: string | undefined;
  }>({ url: undefined, key: undefined });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Ellenőrizzük a környezeti változókat
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setEnvVars({ url, key });

        if (!url || !key) {
          setStatus('error');
          setError('Környezeti változók hiányoznak');
          return;
        }

        if (url === 'https://your-project.supabase.co' || key === 'your-anon-key-here') {
          setStatus('error');
          setError('Placeholder értékek vannak beállítva');
          return;
        }

        // Próbáljuk meg létrehozni a kliens kapcsolatot
        const supabase = getSupabaseClient();
        
        // Egyszerű ping a kapcsolat tesztelésére
        const { data, error: pingError } = await supabase.from('profiles').select('count').limit(1);
        
        if (pingError) {
          setStatus('error');
          setError(`Kapcsolódási hiba: ${pingError.message}`);
        } else {
          setStatus('connected');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
      }
    };

    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Ellenőrzés...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Kapcsolódva</Badge>;
      case 'error':
        return <Badge variant="destructive">Hiba</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Supabase Kapcsolat
        </CardTitle>
        <CardDescription>
          Adatbázis kapcsolat állapota
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Állapot:</span>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>URL:</span>
            <span className={envVars.url ? 'text-green-600' : 'text-red-600'}>
              {envVars.url ? '✅ Beállítva' : '❌ Hiányzik'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>API Key:</span>
            <span className={envVars.key ? 'text-green-600' : 'text-red-600'}>
              {envVars.key ? '✅ Beállítva' : '❌ Hiányzik'}
            </span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Javítási lépések:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Ellenőrizze a .env.local fájlt</li>
              <li>Állítsa be a valós Supabase projekt URL-t</li>
              <li>Állítsa be a valós Supabase anon key-t</li>
              <li>Indítsa újra a development szervert</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
