"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Smartphone, Mail, Key, Copy, CheckCircle, XCircle } from "lucide-react";
import { mfaManager, MFAType, type MFASetup } from "@/lib/security/mfa-manager";
import { useAuth } from "@/lib/providers/auth-provider";

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<MFAType>("totp");
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<MFASetup | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState<Set<number>>(new Set());

  // Form data for SMS/Email setup
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      initializeSetup();
    }
  }, [user, selectedType]);

  const initializeSetup = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSetupData(null);

    try {
      let setup: MFASetup;

      switch (selectedType) {
        case "totp":
          setup = await mfaManager.setupTOTP(user.id);
          break;
        case "sms":
          if (!phoneNumber) {
            setError("Telefonszám megadása kötelező");
            setIsLoading(false);
            return;
          }
          setup = await mfaManager.setupSMS(user.id, phoneNumber);
          break;
        case "email":
          if (!email) {
            setError("Email cím megadása kötelező");
            setIsLoading(false);
            return;
          }
          setup = await mfaManager.setupEmail(user.id, email);
          break;
        default:
          throw new Error("Nem támogatott MFA típus");
      }

      setSetupData(setup);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MFA beállítás sikertelen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!user || !verificationCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await mfaManager.verifyMFA({
        user_id: user.id,
        mfa_type: selectedType,
        code: verificationCode.trim()
      });
      
      if (isValid) {
        setIsVerified(true);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setError("Érvénytelen verifikációs kód");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verifikáció sikertelen");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCodes(prev => new Set([...prev, index]));
    setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
    }, 2000);
    } catch (err) {
      console.error("Vágólapra másolás sikertelen:", err);
    }
  };

  const getMFAIcon = (type: MFAType) => {
    switch (type) {
      case "totp":
        return <Key className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getMFATitle = (type: MFAType) => {
    switch (type) {
      case "totp":
        return "Authenticator App";
      case "sms":
        return "SMS";
      case "email":
        return "Email";
      default:
        return "MFA";
    }
  };

  const getMFADescription = (type: MFAType) => {
    switch (type) {
      case "totp":
        return "Használj Google Authenticator vagy hasonló alkalmazást";
      case "sms":
        return "Kód küldése SMS-ben a telefonszámra";
      case "email":
        return "Kód küldése emailben";
      default:
        return "Két faktoros hitelesítés";
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            MFA Beállítás
          </CardTitle>
          <CardDescription>
            Bejelentkezés szükséges az MFA beállításhoz
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Két Faktoros Hitelesítés Beállítása
        </CardTitle>
        <CardDescription>
          Válassz egy MFA módszert a fiókod védelméhez
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* MFA Type Selection */}
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as MFAType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              TOTP
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* TOTP Setup */}
          <TabsContent value="totp" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>1. Töltsd le a Google Authenticator alkalmazást</p>
              <p>2. Olvasd be a QR kódot vagy add meg a titkos kulcsot</p>
              <p>3. Add meg a generált kódot a verifikációhoz</p>
      </div>
      
            {setupData && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="border rounded-lg p-4 bg-white">
                    <img 
                      src={setupData.qr_code} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* Secret Key */}
                <div className="space-y-2">
                  <Label>Manuális bevitel (ha QR kód nem működik):</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={setupData.secret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(setupData.secret, -1)}
                    >
                      {copiedCodes.has(-1) ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* SMS Setup */}
          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonszám</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+36 20 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                A verifikációs kódot SMS-ben küldjük el erre a számra
              </p>
            </div>

            {setupData && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Verifikációs kód elküldve: <strong>{setupData.verification_code}</strong>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Email Setup */}
          <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email cím</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
              <p className="text-sm text-muted-foreground">
                A verifikációs kódot emailben küldjük el erre a címre
              </p>
              </div>

            {setupData && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Verifikációs kód elküldve: <strong>{setupData.verification_code}</strong>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Setup Button */}
        {!setupData && (
          <Button 
            onClick={initializeSetup} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Beállítás...
            </>
          ) : (
              <>
                {getMFAIcon(selectedType)}
                <span className="ml-2">{getMFATitle(selectedType)} Beállítása</span>
              </>
          )}
        </Button>
        )}

        {/* Verification */}
        {setupData && !isVerified && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification">Verifikációs kód</Label>
              <Input
                id="verification"
                type="text"
                placeholder="6 számjegyű kód"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button 
              onClick={handleVerification} 
              disabled={isLoading || !verificationCode.trim()}
              className="w-full"
            >
              {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ellenőrzés...
                  </>
                ) : (
                "Verifikálás"
                )}
              </Button>
          </div>
        )}

        {/* Backup Codes */}
        {setupData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label>Backup kódok</Label>
              <Badge variant="secondary">10 db</Badge>
        </div>
            <p className="text-sm text-muted-foreground">
              Mentsd el ezeket a kódokat biztonságos helyen. Használhatod őket bejelentkezéshez, ha elveszted a telefonod.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {setupData.backup_codes.map((code, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <span className="font-mono text-sm flex-1">{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, index)}
                  >
                    {copiedCodes.has(index) ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </div>
            </div>
        )}

        {/* Success State */}
        {isVerified && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              MFA sikeresen beállítva! Átirányítás...
        </AlertDescription>
      </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Mégse
            </Button>
          )}
          {setupData && !isVerified && (
            <Button 
              variant="outline" 
              onClick={initializeSetup}
              disabled={isLoading}
              className="flex-1"
            >
              Újraküldés
      </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
