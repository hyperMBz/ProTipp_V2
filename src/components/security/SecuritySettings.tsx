"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Lock, 
  Eye, 
  Key, 
  Users, 
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { useAuth } from "@/lib/providers/auth-provider";
import { mfaManager } from "@/lib/security/mfa-manager";
import { encryptionManager } from "@/lib/security/encryption-manager";
import { apiSecurityManager } from "@/lib/security/api-security";
import { complianceManager } from "@/lib/security/compliance-manager";
import { securityMonitoringManager } from "@/lib/security/monitoring";
import { sessionManager } from "@/lib/security/session-manager";
import { inputValidator } from "@/lib/security/input-validator";

interface SecuritySettingsProps {
  className?: string;
}

export default function SecuritySettings({ className }: SecuritySettingsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<any>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<any>(null);
  const [apiSecurityStatus, setApiSecurityStatus] = useState<any>(null);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<any>(null);
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadSecurityStatus();
    }
  }, [user]);

  const loadSecurityStatus = async () => {
    try {
      setLoading(true);
      
      // MFA státusz betöltése
      const mfaData = await mfaManager.getUserMFAStatus(user?.id || '');
      setMfaStatus(mfaData);

      // Encryption státusz betöltése
      const encryptionData = user ? await encryptionManager.getUserKeys(user.id) : [];
      setEncryptionStatus(encryptionData);

      // API Security státusz betöltése
      const apiData = apiSecurityManager.getUserAPIKeys(user?.id || '');
      setApiSecurityStatus(apiData);

      // Compliance státusz betöltése
      const complianceData = user ? {
        gdpr_enabled: true,
        data_export_enabled: true,
        data_deletion_enabled: true
      } : null;
      setComplianceStatus(complianceData);

      // Monitoring státusz betöltése
      const monitoringData = securityMonitoringManager.getConfig();
      setMonitoringStatus(monitoringData);

      // Session státusz betöltése
      const sessionData = sessionManager.getConfig();
      setSessionStatus(sessionData);

      // Validation státusz betöltése
      const validationData = inputValidator.getConfig();
      setValidationStatus(validationData);
    } catch (error) {
      console.error("Security status loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScore = (): number => {
    let score = 0;
    let total = 0;

    // MFA (25 pont)
    total += 25;
    if (mfaStatus?.enabled) score += 25;

    // Encryption (20 pont)
    total += 20;
    if (encryptionStatus?.length > 0) score += 20;

    // API Security (15 pont)
    total += 15;
    if (apiSecurityStatus?.length > 0) score += 15;

    // Compliance (15 pont)
    total += 15;
    if (complianceStatus?.gdpr_compliant) score += 15;

    // Monitoring (10 pont)
    total += 10;
    if (monitoringStatus?.real_time_monitoring) score += 10;

    // Session Management (10 pont)
    total += 10;
    if (sessionStatus?.enabled) score += 10;

    // Input Validation (5 pont)
    total += 5;
    if (validationStatus?.enabled) score += 5;

    return Math.round((score / total) * 100);
  };

  const getSecurityLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score >= 90) {
      return { level: "Kiváló", color: "text-green-500", icon: <CheckCircle className="h-5 w-5" /> };
    } else if (score >= 70) {
      return { level: "Jó", color: "text-blue-500", icon: <Shield className="h-5 w-5" /> };
    } else if (score >= 50) {
      return { level: "Közepes", color: "text-yellow-500", icon: <AlertTriangle className="h-5 w-5" /> };
    } else {
      return { level: "Gyenge", color: "text-red-500", icon: <XCircle className="h-5 w-5" /> };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(timestamp);
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

    return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Biztonsági Beállítások
          </h1>
          <p className="text-muted-foreground">
            Biztonsági rendszerek konfigurálása és kezelése
          </p>
        </div>
        <Button onClick={loadSecurityStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Frissítés
        </Button>
      </div>

      {/* Biztonsági pontszám */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Biztonsági Pontszám
          </CardTitle>
          <CardDescription>
            A rendszer biztonsági állapotának áttekintése
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">{securityScore}%</div>
              <div>
                <div className={`text-lg font-medium ${securityLevel.color} flex items-center gap-2`}>
                  {securityLevel.icon}
                  {securityLevel.level}
                </div>
                <div className="text-sm text-muted-foreground">
                  Biztonsági szint
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Utolsó ellenőrzés
            </div>
              <div className="text-sm">
                {formatTimestamp(new Date())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fő tartalom */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="encryption">Titkosítás</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="sessions">Session-ök</TabsTrigger>
        </TabsList>

        {/* Áttekintés */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* MFA Status */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Multi-Factor Auth</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {mfaStatus?.enabled ? "Aktív" : "Inaktív"}
                  </div>
                  <Badge variant={mfaStatus?.enabled ? "default" : "secondary"}>
                    {mfaStatus?.enabled ? "Védelem" : "Kikapcsolva"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mfaStatus?.type || "Nincs beállítva"}
                </p>
              </CardContent>
            </Card>

            {/* Encryption Status */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Titkosítás</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {encryptionStatus?.length || 0}
                  </div>
                  <Badge variant={encryptionStatus?.length > 0 ? "default" : "secondary"}>
                    {encryptionStatus?.length > 0 ? "Aktív kulcsok" : "Nincs kulcs"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aktív titkosítási kulcsok
                </p>
              </CardContent>
            </Card>

            {/* API Security Status */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Biztonság</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {apiSecurityStatus?.length || 0}
                  </div>
                  <Badge variant={apiSecurityStatus?.length > 0 ? "default" : "secondary"}>
                    {apiSecurityStatus?.length > 0 ? "API kulcsok" : "Nincs kulcs"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aktív API kulcsok
                </p>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GDPR Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {complianceStatus?.gdpr_compliant ? "Igen" : "Nem"}
                  </div>
                  <Badge variant={complianceStatus?.gdpr_compliant ? "default" : "destructive"}>
                    {complianceStatus?.gdpr_compliant ? "Compliant" : "Nem compliant"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  GDPR megfelelőség
                </p>
              </CardContent>
            </Card>

            {/* Monitoring Status */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {monitoringStatus?.real_time_monitoring ? "Aktív" : "Inaktív"}
                  </div>
                  <Badge variant={monitoringStatus?.real_time_monitoring ? "default" : "secondary"}>
                    {monitoringStatus?.real_time_monitoring ? "Valós idő" : "Kikapcsolva"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valós idejű monitoring
                </p>
              </CardContent>
            </Card>

            {/* Session Management */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Session Kezelés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {sessionStatus?.enabled ? "Aktív" : "Inaktív"}
                  </div>
                  <Badge variant={sessionStatus?.enabled ? "default" : "secondary"}>
                    {sessionStatus?.enabled ? "Védelem" : "Kikapcsolva"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Session timeout: {sessionStatus?.policies?.session_timeout || 0} perc
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MFA Beállítások */}
        <TabsContent value="mfa" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>
                Két faktoros hitelesítés beállítása és kezelése
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">MFA Státusz</div>
                    <div className="text-sm text-muted-foreground">
                      {mfaStatus?.enabled ? "Aktív" : "Inaktív"}
                    </div>
                  </div>
                  <Badge variant={mfaStatus?.enabled ? "default" : "secondary"}>
                    {mfaStatus?.enabled ? "Védelem aktív" : "Védelem kikapcsolva"}
                  </Badge>
                </div>

                {mfaStatus?.enabled && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium">MFA Típus</div>
                      <div className="text-sm text-muted-foreground">
                        {mfaStatus?.type || "Nincs beállítva"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Utolsó használat</div>
                      <div className="text-sm text-muted-foreground">
                        {mfaStatus?.last_used ? formatTimestamp(new Date(mfaStatus.last_used)) : "Nincs adat"}
                      </div>
              </div>
                  </>
                )}

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    MFA Beállítása
                  </Button>
                  {mfaStatus?.enabled && (
                    <Button variant="outline" size="sm">
                      MFA Módosítása
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Titkosítás Beállítások */}
        <TabsContent value="encryption" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Adattitkosítás
              </CardTitle>
              <CardDescription>
                Titkosítási kulcsok kezelése és konfigurálása
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Aktív Kulcsok</div>
                    <div className="text-sm text-muted-foreground">
                      {encryptionStatus?.length || 0} aktív kulcs
                    </div>
                  </div>
                  <Badge variant={encryptionStatus?.length > 0 ? "default" : "secondary"}>
                    {encryptionStatus?.length > 0 ? "Titkosítás aktív" : "Nincs kulcs"}
                  </Badge>
              </div>

                {encryptionStatus?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="font-medium">Utolsó Kulcs Létrehozás</div>
                      <div className="text-sm text-muted-foreground">
                        {encryptionStatus[0]?.created_at ? formatTimestamp(new Date(encryptionStatus[0].created_at)) : "Nincs adat"}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Új Kulcs Generálása
                  </Button>
                  <Button variant="outline" size="sm">
                    Kulcsok Kezelése
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Biztonság */}
        <TabsContent value="api" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Biztonság
              </CardTitle>
              <CardDescription>
                API kulcsok és biztonsági beállítások kezelése
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">API Kulcsok</div>
                    <div className="text-sm text-muted-foreground">
                      {apiSecurityStatus?.length || 0} aktív kulcs
                </div>
              </div>
                  <Badge variant={apiSecurityStatus?.length > 0 ? "default" : "secondary"}>
                    {apiSecurityStatus?.length > 0 ? "API védett" : "Nincs kulcs"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Új API Kulcs
                  </Button>
                  <Button variant="outline" size="sm">
                    Kulcsok Kezelése
                  </Button>
                  <Button variant="outline" size="sm">
                    Rate Limiting
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                GDPR Compliance
              </CardTitle>
              <CardDescription>
                Adatvédelmi megfelelőség és beállítások
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                    <div className="font-medium">GDPR Megfelelőség</div>
                    <div className="text-sm text-muted-foreground">
                      {complianceStatus?.gdpr_compliant ? "Megfelelő" : "Nem felel meg"}
                    </div>
                  </div>
                  <Badge variant={complianceStatus?.gdpr_compliant ? "default" : "destructive"}>
                    {complianceStatus?.gdpr_compliant ? "Compliant" : "Nem compliant"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Compliance Jelentés
                  </Button>
                  <Button variant="outline" size="sm">
                    Adatigénylések
                  </Button>
                  <Button variant="outline" size="sm">
                    Hozzájárulások
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Biztonsági Monitoring
              </CardTitle>
              <CardDescription>
                Valós idejű biztonsági események és riasztások
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Monitoring Státusz</div>
                    <div className="text-sm text-muted-foreground">
                      {monitoringStatus?.real_time_monitoring ? "Valós időben aktív" : "Kikapcsolva"}
                </div>
                </div>
                  <Badge variant={monitoringStatus?.real_time_monitoring ? "default" : "secondary"}>
                    {monitoringStatus?.real_time_monitoring ? "Aktív" : "Inaktív"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Monitoring Dashboard
                  </Button>
                  <Button variant="outline" size="sm">
                    Riasztások
                  </Button>
                  <Button variant="outline" size="sm">
                    Beállítások
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Management */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Session Kezelés
              </CardTitle>
              <CardDescription>
                Aktív session-ök és timeout beállítások
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Session Védelem</div>
                    <div className="text-sm text-muted-foreground">
                      {sessionStatus?.enabled ? "Aktív" : "Inaktív"}
                </div>
              </div>
                  <Badge variant={sessionStatus?.enabled ? "default" : "secondary"}>
                    {sessionStatus?.enabled ? "Védelem aktív" : "Védelem kikapcsolva"}
                  </Badge>
              </div>

                {sessionStatus?.enabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">Session Timeout</div>
                        <div className="text-sm text-muted-foreground">
                          {sessionStatus?.policies?.session_timeout || 0} perc
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Idle Timeout</div>
                        <div className="text-sm text-muted-foreground">
                          {sessionStatus?.policies?.idle_timeout || 0} perc
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Aktív Session-ök
                  </Button>
                  <Button variant="outline" size="sm">
                    Beállítások
                  </Button>
                  <Button variant="outline" size="sm">
                    Minden Session Érvénytelenítése
              </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
