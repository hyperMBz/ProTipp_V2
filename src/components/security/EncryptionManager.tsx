/**
 * Encryption Manager UI Component
 * Kulcskezelés és adattitkosítás felhasználói felülete
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Lock, 
  Unlock, 
  Shield, 
  Copy, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/unified-auth-provider';
import { 
  encryptionManager, 
  EncryptionKey, 
  EncryptedData 
} from '@/lib/security/encryption-manager';

export default function EncryptionManagerComponent() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Master key generation
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Data encryption/decryption
  const [plainText, setPlainText] = useState('');
  const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadUserKeys();
    }
  }, [user]);

  const loadUserKeys = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userKeys = await encryptionManager.getUserKeys(user.id);
      setKeys(userKeys);
      if (userKeys.length > 0) {
        setSelectedKeyId(userKeys[0].id);
      }
    } catch (error) {
      setError('Kulcsok betöltése sikertelen');
      console.error('Load keys error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMasterKey = async () => {
    if (!user) return;
    
    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek');
      return;
    }

    if (password.length < 8) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const masterKey = await encryptionManager.generateMasterKey(user.id, password);
      setSuccess('Master kulcs sikeresen generálva');
      setPassword('');
      setConfirmPassword('');
      
      // Reload keys
      await loadUserKeys();
    } catch (error) {
      setError('Master kulcs generálás sikertelen');
      console.error('Master key generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSessionKey = async () => {
    if (!user || !selectedKeyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const sessionKey = await encryptionManager.generateSessionKey(user.id, selectedKeyId);
      setSuccess('Session kulcs sikeresen generálva');
      
      // Reload keys
      await loadUserKeys();
    } catch (error) {
      setError('Session kulcs generálás sikertelen');
      console.error('Session key generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const encryptData = async () => {
    if (!plainText.trim() || !selectedKeyId) {
      setError('Kérjük, adjon meg szöveget és válasszon kulcsot');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const encrypted = await encryptionManager.encryptData(plainText, selectedKeyId);
      setEncryptedData(encrypted);
      setSuccess('Adat sikeresen titkosítva');
    } catch (error) {
      setError('Adat titkosítás sikertelen');
      console.error('Encryption error:', error);
    } finally {
      setLoading(false);
    }
  };

  const decryptData = async () => {
    if (!encryptedData) {
      setError('Nincs titkosított adat');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const decrypted = await encryptionManager.decryptData(encryptedData);
      setDecryptedText(decrypted);
      setSuccess('Adat sikeresen visszafejtve');
    } catch (error) {
      setError('Adat visszafejtés sikertelen');
      console.error('Decryption error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deactivateKey = async (keyId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await encryptionManager.deactivateKey(keyId);
      setSuccess('Kulcs sikeresen inaktiválva');
      
      // Reload keys
      await loadUserKeys();
    } catch (error) {
      setError('Kulcs inaktiválás sikertelen');
      console.error('Key deactivation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Szöveg másolva a vágólapra');
  };

  const getKeyTypeIcon = (keyType: string) => {
    switch (keyType) {
      case 'master':
        return <Key className="h-4 w-4" />;
      case 'session':
        return <RefreshCw className="h-4 w-4" />;
      case 'data':
        return <Shield className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const getKeyTypeColor = (keyType: string) => {
    switch (keyType) {
      case 'master':
        return 'bg-red-500';
      case 'session':
        return 'bg-blue-500';
      case 'data':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Titkosítási Kulcsok Kezelése
          </CardTitle>
          <CardDescription>
            Master és session kulcsok generálása és kezelése
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keys" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="keys">Kulcsok</TabsTrigger>
              <TabsTrigger value="encrypt">Titkosítás</TabsTrigger>
              <TabsTrigger value="decrypt">Visszafejtés</TabsTrigger>
            </TabsList>

            <TabsContent value="keys" className="space-y-4">
              {/* Master Key Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Master Kulcs Generálása
                  </CardTitle>
                  <CardDescription>
                    Generáljon egy master kulcsot a jelszavával
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Jelszó</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Adja meg a jelszavát"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ismételje meg a jelszavát"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={generateMasterKey} 
                    disabled={loading || !password || !confirmPassword}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Master Kulcs Generálása
                  </Button>
                </CardContent>
              </Card>

              {/* Session Key Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Session Kulcs Generálása
                  </CardTitle>
                  <CardDescription>
                    Generáljon egy session kulcsot a master kulcsból
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={generateSessionKey} 
                    disabled={loading || keys.length === 0}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Session Kulcs Generálása
                  </Button>
                </CardContent>
              </Card>

              {/* Keys List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aktív Kulcsok</CardTitle>
                  <CardDescription>
                    Az Ön aktív titkosítási kulcsai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : keys.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nincsenek aktív kulcsok. Generáljon egy master kulcsot.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {keys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getKeyTypeIcon(key.key_type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {key.key_type === 'master' ? 'Master Kulcs' : 
                                   key.key_type === 'session' ? 'Session Kulcs' : 'Adat Kulcs'}
                                </span>
                                <Badge className={getKeyTypeColor(key.key_type)}>
                                  {key.key_type}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Létrehozva: {key.created_at.toLocaleDateString()}
                                {key.expires_at && (
                                  <span className="ml-2">
                                    Lejár: {key.expires_at.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(key.id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deactivateKey(key.id)}
                              disabled={key.key_type === 'master'}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="encrypt" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Adat Titkosítás
                  </CardTitle>
                  <CardDescription>
                    Titkosítson bizalmas adatokat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keySelect">Válasszon kulcsot</Label>
                    <select
                      id="keySelect"
                      value={selectedKeyId}
                      onChange={(e) => setSelectedKeyId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Válasszon kulcsot...</option>
                      {keys.map((key) => (
                        <option key={key.id} value={key.id}>
                          {key.key_type === 'master' ? 'Master Kulcs' : 
                           key.key_type === 'session' ? 'Session Kulcs' : 'Adat Kulcs'} 
                          - {key.created_at.toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plainText">Szöveg titkosításhoz</Label>
                    <Textarea
                      id="plainText"
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      placeholder="Írja be a titkosítandó szöveget..."
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={encryptData} 
                    disabled={loading || !plainText.trim() || !selectedKeyId}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Titkosítás
                  </Button>

                  {encryptedData && (
                    <div className="space-y-2">
                      <Label>Titkosított adat</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <pre className="text-sm break-all">
                          {JSON.stringify(encryptedData, null, 2)}
                        </pre>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(encryptedData))}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Másolás
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decrypt" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    Adat Visszafejtés
                  </CardTitle>
                  <CardDescription>
                    Fejtse vissza a titkosított adatokat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="encryptedData">Titkosított adat (JSON)</Label>
                    <Textarea
                      id="encryptedData"
                      placeholder="Illessze be a titkosított adatot JSON formátumban..."
                      rows={6}
                      onChange={(e) => {
                        try {
                          const data = JSON.parse(e.target.value);
                          setEncryptedData(data);
                        } catch (error) {
                          setEncryptedData(null);
                        }
                      }}
                    />
                  </div>
                  
                  <Button 
                    onClick={decryptData} 
                    disabled={loading || !encryptedData}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Unlock className="h-4 w-4 mr-2" />
                    )}
                    Visszafejtés
                  </Button>

                  {decryptedText && (
                    <div className="space-y-2">
                      <Label>Visszafejtett szöveg</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <pre className="text-sm whitespace-pre-wrap">
                          {decryptedText}
                        </pre>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(decryptedText)}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Másolás
                      </Button>
                    </div>
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
