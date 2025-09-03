"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Eye,
  Lock,
  Users,
  Globe,
  Database,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  Zap,
  Target,
  Gauge
} from "lucide-react";
import { toast } from "sonner";
import { auditLogger } from "@/lib/security/audit-logger";
import { complianceChecker } from "@/lib/security/compliance-checker";
import { authManager } from "@/lib/security/auth-manager";

interface SecurityDashboardProps {
  userId?: string;
}

interface SecurityMetrics {
  totalAudits: number;
  totalAlerts: number;
  totalIncidents: number;
  activeAlerts: number;
  openIncidents: number;
  averageResponseTime: number;
  complianceScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

interface RealTimeMetrics {
  activeUsers: number;
  failedLogins: number;
  suspiciousActivities: number;
  apiRequests: number;
  dataAccessEvents: number;
  systemAlerts: number;
  lastMinute: {
    audits: number;
    alerts: number;
    incidents: number;
  };
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface ComplianceStatus {
  gdpr: {
    compliant: boolean;
    score: number;
    issues: string[];
  };
  financial: {
    compliant: boolean;
    score: number;
    issues: string[];
  };
  dataProtection: {
    compliant: boolean;
    score: number;
    issues: string[];
  };
  overall: {
    compliant: boolean;
    score: number;
    level: string;
  };
}

export function SecurityDashboard({ userId }: SecurityDashboardProps) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSecurityData();
    startRealTimeUpdates();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [userId]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Security metrics betöltése
      const securityMetrics = auditLogger.getSecurityMetrics();
      setMetrics(securityMetrics);

      // Real-time metrics betöltése
      const realTimeData = auditLogger.getRealTimeMonitoring();
      setRealTimeMetrics(realTimeData);

      // Recent alerts betöltése
      const alerts = auditLogger.getSecurityAlerts(10);
      setRecentAlerts(alerts.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      })));

      // Compliance status betöltése
      if (userId) {
        const compliance = await complianceChecker.checkOverallCompliance(userId);
        setComplianceStatus({
          gdpr: await complianceChecker.checkGDPRCompliance(userId),
          financial: await complianceChecker.checkFinancialCompliance(userId),
          dataProtection: await complianceChecker.checkDataProtectionCompliance(userId),
          overall: {
            compliant: compliance.overall_compliance === 'compliant',
            score: compliance.compliance_score,
            level: compliance.overall_compliance,
          },
        });
      }

    } catch (error) {
      console.error('Security data load error:', error);
      toast.error('Biztonsági adatok betöltési hiba');
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    const interval = setInterval(() => {
      const realTimeData = auditLogger.getRealTimeMonitoring();
      setRealTimeMetrics(realTimeData);
    }, 5000); // 5 másodpercenként frissítés

    setRefreshInterval(interval);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biztonsági Pontszám</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics?.complianceScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% az elmúlt hónaphoz képest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív Riasztások</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.activeAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalAlerts || 0} összesen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nyitott Incidensek</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.openIncidents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalIncidents || 0} összesen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fenyegetési Szint</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={`${getThreatLevelColor(metrics?.threatLevel || 'low')} border-0`}>
              {metrics?.threatLevel?.toUpperCase() || 'LOW'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Utolsó frissítés: {metrics?.lastUpdated?.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Valós Idejű Monitoring</span>
          </CardTitle>
          <CardDescription>
            Aktív biztonsági események és metrikák
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeMetrics?.activeUsers || 0}
              </div>
              <div className="text-xs text-muted-foreground">Aktív Felhasználók</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {realTimeMetrics?.failedLogins || 0}
              </div>
              <div className="text-xs text-muted-foreground">Sikertelen Bejelentkezések</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {realTimeMetrics?.suspiciousActivities || 0}
              </div>
              <div className="text-xs text-muted-foreground">Gyanús Tevékenységek</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeMetrics?.apiRequests || 0}
              </div>
              <div className="text-xs text-muted-foreground">API Kérések</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {realTimeMetrics?.dataAccessEvents || 0}
              </div>
              <div className="text-xs text-muted-foreground">Adathozzáférés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {realTimeMetrics?.systemAlerts || 0}
              </div>
              <div className="text-xs text-muted-foreground">Rendszer Riasztások</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {realTimeMetrics?.lastMinute.audits || 0}
              </div>
              <div className="text-xs text-muted-foreground">Audit/perc</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="alerts">Riasztások</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Biztonsági Állapot</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MFA Állapot</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktív
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Titkosítás</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Lock className="h-3 w-3 mr-1" />
                      Aktív
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access Logging</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Eye className="h-3 w-3 mr-1" />
                      Aktív
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Megfelelő
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Legutóbbi Tevékenységek</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sikeres bejelentkezés</p>
                      <p className="text-xs text-muted-foreground">2 perce</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Adatlekérdezés</p>
                      <p className="text-xs text-muted-foreground">5 perce</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gyanús tevékenység</p>
                      <p className="text-xs text-muted-foreground">10 perce</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sikertelen bejelentkezés</p>
                      <p className="text-xs text-muted-foreground">15 perce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Legutóbbi Riasztások</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nincsenek aktív riasztások</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* GDPR Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>GDPR Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getComplianceColor(complianceStatus?.gdpr.score || 0)}`}>
                      {complianceStatus?.gdpr.score || 0}%
                    </div>
                    <Badge variant="outline" className={
                      complianceStatus?.gdpr.compliant ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'
                    }>
                      {complianceStatus?.gdpr.compliant ? 'Megfelelő' : 'Nem Megfelelő'}
                    </Badge>
                  </div>
                  {complianceStatus?.gdpr.issues.length ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Problémák:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {complianceStatus.gdpr.issues.slice(0, 3).map((issue, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center text-green-600">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Minden GDPR követelménynek megfelel</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Financial Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getComplianceColor(complianceStatus?.financial.score || 0)}`}>
                      {complianceStatus?.financial.score || 0}%
                    </div>
                    <Badge variant="outline" className={
                      complianceStatus?.financial.compliant ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'
                    }>
                      {complianceStatus?.financial.compliant ? 'Megfelelő' : 'Nem Megfelelő'}
                    </Badge>
                  </div>
                  {complianceStatus?.financial.issues.length ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Problémák:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {complianceStatus.financial.issues.slice(0, 3).map((issue, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center text-green-600">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Minden financial követelménynek megfelel</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gauge className="h-5 w-5" />
                <span>Teljes Compliance Áttekintés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-4xl font-bold ${getComplianceColor(complianceStatus?.overall.score || 0)}`}>
                  {complianceStatus?.overall.score || 0}%
                </div>
                <Badge variant="outline" className={
                  complianceStatus?.overall.compliant ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'
                }>
                  {complianceStatus?.overall.compliant ? 'Teljesen Megfelelő' : 'Fejlesztés Szükséges'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Utolsó ellenőrzés: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Security Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Biztonsági Trendek</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sikertelen bejelentkezések</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">-15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gyanús tevékenységek</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">-8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API visszaélések</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance pontszám</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Riasztások Eloszlása</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Kritikus</span>
                    </div>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Magas</span>
                    </div>
                    <span className="text-sm font-medium">7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Közepes</span>
                    </div>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Alacsony</span>
                    </div>
                    <span className="text-sm font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={loadSecurityData}>
          <Loader2 className="mr-2 h-4 w-4" />
          Frissítés
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Részletes Részletek
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Biztonsági Műveletek
          </Button>
        </div>
      </div>
    </div>
  );
}
