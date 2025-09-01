/**
 * API Security Manager UI Component
 * API kulcsok kezelése és rate limiting beállítások
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Shield, 
  Copy, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { 
  apiSecurityManager, 
  APIKey, 
  RateLimitInfo,
  SecurityConfig 
} from '@/lib/security/api-security';

export default function APISecurityManagerComponent() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  // API key generation
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [showGeneratedKey, setShowGeneratedKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string>('');
  
  // Rate limit testing
  const [testIdentifier, setTestIdentifier] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  useEffect(() => {
    if (user) {
      loadUserAPIKeys();
      loadConfig();
      loadStats();
    }
  }, [user]);

  const loadUserAPIKeys = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userKeys = await apiSecurityManager.getUserAPIKeys(user.id);
      setApiKeys(userKeys);
    } catch (error) {
      setError('API kulcsok betöltése sikertelen');
      console.error('Load API keys error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const currentConfig = apiSecurityManager.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Config load error:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const userStats = await apiSecurityManager.getAPIStats(user.id, 30);
      setStats(userStats);
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  const generateAPIKey = async () => {
    if (!user || !keyName.trim()) {
      setError('Kérjük, adjon meg egy nevet az API kulcshoz');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newAPIKey = await apiSecurityManager.generateAPIKey(user.id, keyName, permissions);
      setGeneratedKey(newAPIKey.key_hash);
      setShowGeneratedKey(true);
      setSuccess('API kulcs sikeresen generálva');
      setKeyName('');
      setPermissions([]);
      
      // Reload keys
      await loadUserAPIKeys();
    } catch (error) {
      setError('API kulcs generálás sikertelen');
      console.error('API key generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deactivateAPIKey = async (keyId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiSecurityManager.deactivateAPIKey(keyId);
      setSuccess('API kulcs sikeresen inaktiválva');
      
      // Reload keys
      await loadUserAPIKeys();
    } catch (error) {
      setError('API kulcs inaktiválás sikertelen');
      console.error('API key deactivation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testRateLimit = async () => {
    if (!testIdentifier.trim()) {
      setError('Kérjük, adjon meg egy azonosítót');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const rateLimit = await apiSecurityManager.checkRateLimit(testIdentifier);
      setRateLimitInfo(rateLimit);
      setSuccess('Rate limit teszt sikeres');
    } catch (error) {
      setError('Rate limit teszt sikertelen');
      console.error('Rate limit test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Szöveg másolva a vágólapra');
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const getPermissionColor = (permission: string) => {
    const colors: Record<string, string> = {
      'read': 'bg-blue-500',
      'write': 'bg-green-500',
      'delete': 'bg-red-500',
      'admin': 'bg-purple-500'
    };
    return colors[permission] || 'bg-gray-500';
  };

  const availablePermissions = ['read', 'write', 'delete', 'admin'];

  return (
    <div className="space-y-6">
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Biztonság Kezelése
          </CardTitle>
          <CardDescription>
            API kulcsok generálása, rate limiting és biztonsági beállítások
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keys" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="keys">API Kulcsok</TabsTrigger>
              <TabsTrigger value="rate-limit">Rate Limiting</TabsTrigger>
              <TabsTrigger value="stats">Statisztikák</TabsTrigger>
              <TabsTrigger value="config">Beállítások</TabsTrigger>
            </TabsList>

            <TabsContent value="keys" className="space-y-4">
              {/* API Key Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Új API Kulcs Generálása
                  </CardTitle>
                  <CardDescription>
                    Generáljon egy új API kulcsot a megadott jogosultságokkal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">API Kulcs Neve</Label>
                    <Input
                      id="keyName"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="pl. Production API Key"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Jogosultságok</Label>
                    <div className="flex flex-wrap gap-2">
                      {availablePermissions.map((permission) => (
                        <Badge
                          key={permission}
                          className={`cursor-pointer ${
                            permissions.includes(permission) 
                              ? getPermissionColor(permission) 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                          onClick={() => togglePermission(permission)}
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={generateAPIKey} 
                    disabled={loading || !keyName.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    API Kulcs Generálása
                  </Button>

                  {showGeneratedKey && generatedKey && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">API Kulcs sikeresen generálva!</p>
                          <p className="text-sm text-muted-foreground">
                            Kérjük, mentse el ezt a kulcsot biztonságos helyre. 
                            Csak egyszer jelenik meg.
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm break-all">
                              {generatedKey}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedKey)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGeneratedKey(false)}
                          >
                            Bezárás
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* API Keys List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aktív API Kulcsok</CardTitle>
                  <CardDescription>
                    Az Ön aktív API kulcsai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : apiKeys.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nincsenek aktív API kulcsok. Generáljon egy új kulcsot.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{key.name}</span>
                                <Badge variant="outline">
                                  {key.rate_limit} req/óra
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Létrehozva: {key.created_at.toLocaleDateString()}
                                {key.last_used && (
                                  <span className="ml-2">
                                    Utoljára használva: {key.last_used.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {key.permissions.map((permission) => (
                                  <Badge
                                    key={permission}
                                    className={getPermissionColor(permission)}
                                    variant="secondary"
                                  >
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deactivateAPIKey(key.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rate-limit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Rate Limiting Teszt
                  </CardTitle>
                  <CardDescription>
                    Tesztelje a rate limiting funkciót
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testIdentifier">Teszt Azonosító</Label>
                    <Input
                      id="testIdentifier"
                      value={testIdentifier}
                      onChange={(e) => setTestIdentifier(e.target.value)}
                      placeholder="pl. test-user-123"
                    />
                  </div>
                  
                  <Button 
                    onClick={testRateLimit} 
                    disabled={loading || !testIdentifier.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Rate Limit Teszt
                  </Button>

                  {rateLimitInfo && (
                    <div className="space-y-2">
                      <Label>Rate Limit Információ</Label>
                      <div className="p-3 bg-muted rounded-md space-y-2">
                        <div className="flex justify-between">
                          <span>Aktuális kérések:</span>
                          <span className="font-medium">{rateLimitInfo.current}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Limit:</span>
                          <span className="font-medium">{rateLimitInfo.limit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maradék:</span>
                          <span className="font-medium">{rateLimitInfo.remaining}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reset idő:</span>
                          <span className="font-medium">
                            {rateLimitInfo.reset_time.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    API Statisztikák
                  </CardTitle>
                  <CardDescription>
                    Az Ön API használati statisztikái az elmúlt 30 napból
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{stats.total_requests}</div>
                        <div className="text-sm text-muted-foreground">Összes kérés</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.successful_requests}
                        </div>
                        <div className="text-sm text-muted-foreground">Sikeres kérés</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {stats.failed_requests}
                        </div>
                        <div className="text-sm text-muted-foreground">Sikertelen kérés</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {Math.round(stats.average_response_time)}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Átlagos válaszidő</div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nincsenek elérhető statisztikák.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Biztonsági Beállítások
                  </CardTitle>
                  <CardDescription>
                    API biztonsági konfiguráció megtekintése
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {config ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Alapértelmezett Rate Limit</div>
                          <div className="text-sm text-muted-foreground">
                            {config.default_rate_limit} kérés / {config.default_rate_limit_window} másodperc
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Max API Kulcsok</div>
                          <div className="text-sm text-muted-foreground">
                            {config.max_api_keys_per_user} kulcs felhasználónként
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Max Kérés Méret</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(config.max_request_size / 1024 / 1024)} MB
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Engedélyezett Metódusok</div>
                          <div className="text-sm text-muted-foreground">
                            {config.allowed_methods.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Konfiguráció betöltése sikertelen.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
