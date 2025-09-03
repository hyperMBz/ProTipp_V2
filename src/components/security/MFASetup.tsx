"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Smartphone, Mail, Key, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSecurity } from '@/lib/hooks/use-security';
import { cn } from '@/lib/utils';

interface MFASetupProps {
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function MFASetup({ userId, onComplete, onCancel, className }: MFASetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'complete'>('method');
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaSetup, setMfaSetup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState<string[]>([]);

  const { enableMFA, verifyMFA } = useSecurity(userId);

  const handleMethodSelect = (method: 'totp' | 'sms' | 'email') => {
    setSelectedMethod(method);
    setStep('setup');
    setupMFA(method);
  };

  const setupMFA = async (method: 'totp' | 'sms' | 'email') => {
    setIsLoading(true);
    setError(null);

    try {
      const setup = await enableMFA(method);
      if (setup) {
        setMfaSetup(setup);
        setStep('verify');
      } else {
        throw new Error('Failed to setup MFA');
      }
    } catch (err) {
      setError(err.message || 'Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyMFA(verificationCode);
      if (isValid) {
        setStep('complete');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, codeIndex?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (codeIndex !== undefined) {
        setCopiedCodes([...copiedCodes, codeIndex.toString()]);
        setTimeout(() => {
          setCopiedCodes(prev => prev.filter(c => c !== codeIndex.toString()));
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Kétfaktoros Hitelesítés Beállítása
        </h2>
        <p className="text-muted-foreground mt-2">
          Válaszd ki a kétfaktoros hitelesítés módját a fokozott biztonság érdekében
        </p>
      </div>

      <div className="grid gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            selectedMethod === 'totp' && "border-primary"
          )}
          onClick={() => handleMethodSelect('totp')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Authenticator Alkalmazás (Ajánlott)</h3>
                <p className="text-sm text-muted-foreground">
                  Google Authenticator, Authy vagy más TOTP alkalmazás
                </p>
              </div>
              <Badge variant="default">Legbiztonságosabb</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            selectedMethod === 'sms' && "border-primary"
          )}
          onClick={() => handleMethodSelect('sms')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">SMS Üzenet</h3>
                <p className="text-sm text-muted-foreground">
                  Kód küldése SMS-ben a telefonszámra
                </p>
              </div>
              <Badge variant="secondary">Közepes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            selectedMethod === 'email' && "border-primary"
          )}
          onClick={() => handleMethodSelect('email')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Mail className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">
                  Kód küldése email címre
                </p>
              </div>
              <Badge variant="outline">Alapszintű</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTOTPSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Authenticator Alkalmazás Beállítása</h2>
        <p className="text-muted-foreground mt-2">
          Szkenneld be a QR kódot vagy add meg manuálisan a titkos kulcsot
        </p>
      </div>

      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr">QR Kód</TabsTrigger>
          <TabsTrigger value="manual">Manuális</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qr" className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              <img 
                src={mfaSetup?.qr_code} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Szkenneld be ezt a QR kódot az authenticator alkalmazásodban
          </p>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-2">
            <Label>Titkos Kulcs</Label>
            <div className="flex space-x-2">
              <Input
                value={mfaSetup?.secret || ''}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(mfaSetup?.secret || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add meg ezt a kulcsot manuálisan az authenticator alkalmazásban
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {mfaSetup?.backup_codes && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Biztonsági Mentési Kódok</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Mentsd el ezeket a kódokat biztonságos helyen. Használhatod őket, ha elveszíted a telefonod:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mfaSetup.backup_codes.map((code: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                    {code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, index)}
                    className="h-6 w-6 p-0"
                  >
                    {copiedCodes.includes(index.toString()) ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Ellenőrző Kód</h2>
        <p className="text-muted-foreground mt-2">
          Add meg a 6 jegyű kódot az authenticator alkalmazásodból
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">Ellenőrző Kód</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setStep('method')}
            className="flex-1"
          >
            Vissza
          </Button>
          <Button
            onClick={handleVerification}
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1"
          >
            {isLoading ? 'Ellenőrzés...' : 'Ellenőrzés'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-500">Sikeres Beállítás!</h2>
        <p className="text-muted-foreground mt-2">
          A kétfaktoros hitelesítés sikeresen engedélyezve
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Fontos Információk</AlertTitle>
        <AlertDescription className="space-y-2">
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>A fiókod mostantól kétfaktoros hitelesítéssel védett</li>
            <li>Minden bejelentkezéskor meg kell adnod a kódot</li>
            <li>Tartsd biztonságos helyen a biztonsági mentési kódokat</li>
            <li>Ha elveszíted a telefonod, használd a mentési kódokat</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Button onClick={onComplete} className="w-full">
        Befejezés
      </Button>
    </div>
  );

  return (
    <Card className={cn("w-full max-w-2xl mx-auto gradient-bg border-primary/20", className)}>
      <CardContent className="p-8">
        {isLoading && step === 'setup' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>MFA beállítás...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {step === 'method' && renderMethodSelection()}
            {step === 'setup' && selectedMethod === 'totp' && renderTOTPSetup()}
            {step === 'verify' && renderVerification()}
            {step === 'complete' && renderComplete()}
          </>
        )}

        {step !== 'complete' && onCancel && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onCancel}>
              Mégse
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
