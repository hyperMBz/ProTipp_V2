"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  MapPin,
  User,
  Globe
} from "lucide-react";
import { useAuth } from "@/lib/providers/auth-provider";
import securityMonitoringManager, { 
  SecurityEvent, 
  SecurityAlert, 
  ThreatIndicator,
  MonitoringConfig 
} from "@/lib/security/monitoring";

interface SecurityMonitoringProps {
  className?: string;
}

export default function SecurityMonitoring({ className }: SecurityMonitoringProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<ThreatIndicator[]>([]);
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filters, setFilters] = useState({
    event_type: "",
    severity: "",
    resolved: undefined as boolean | undefined
  });

  useEffect(() => {
    if (user) {
      loadData();
      loadConfig();
      loadStats();
      
      // Valós idejű frissítés
      const interval = setInterval(() => {
        loadData();
        loadStats();
      }, 30000); // 30 másodpercenként

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Események betöltése
      const eventsData = await securityMonitoringManager.getSecurityEvents(filters);
      setEvents(eventsData);

      // Riasztások betöltése (mock data - valós implementációban API hívás)
      const mockAlerts: SecurityAlert[] = [
        {
          id: "1",
          event_id: "1",
          alert_type: "dashboard",
          recipient: "admin",
          message: "🔴 CRITICAL Security Alert\n\n**Event Type**: failed_login\n**Description**: Multiple failed login attempts detected\n**IP Address**: 192.168.1.100",
          sent: true,
          sent_at: new Date(),
          retry_count: 0,
          max_retries: 3
        }
      ];
      setAlerts(mockAlerts);

      // Fenyegetési indikátorok betöltése
      const indicatorsData = await securityMonitoringManager.getThreatIndicators();
      setThreatIndicators(indicatorsData);
    } catch (error) {
      console.error("Data loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const configData = securityMonitoringManager.getConfig();
      setConfig(configData);
    } catch (error) {
      console.error("Config loading error:", error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await securityMonitoringManager.getMonitoringStats();
      setStats(statsData);
    } catch (error) {
      console.error("Stats loading error:", error);
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      await securityMonitoringManager.resolveSecurityEvent(
        eventId, 
        user?.id || "admin", 
        resolutionNotes
      );
      setResolutionNotes("");
      setSelectedEvent(null);
      loadData();
    } catch (error) {
      console.error("Event resolution error:", error);
    }
  };

  const handleBlockIP = async (ipAddress: string) => {
    try {
      await securityMonitoringManager.blockIPAddress(ipAddress, "Manual block by admin");
      loadData();
    } catch (error) {
      console.error("IP blocking error:", error);
    }
  };

  const handleUnblockIP = async (ipAddress: string) => {
    try {
      await securityMonitoringManager.unblockIPAddress(ipAddress);
      loadData();
    } catch (error) {
      console.error("IP unblocking error:", error);
    }
  };

  const updateConfig = (newConfig: Partial<MonitoringConfig>) => {
    if (config) {
      const updatedConfig = { ...config, ...newConfig };
      securityMonitoringManager.updateConfig(updatedConfig);
      setConfig(updatedConfig);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "login_attempt": return <User className="h-4 w-4" />;
      case "failed_login": return <XCircle className="h-4 w-4" />;
      case "suspicious_activity": return <AlertTriangle className="h-4 w-4" />;
      case "data_access": return <Eye className="h-4 w-4" />;
      case "api_abuse": return <Globe className="h-4 w-4" />;
      case "encryption_error": return <Shield className="h-4 w-4" />;
      case "compliance_violation": return <Ban className="h-4 w-4" />;
      case "system_alert": return <Bell className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(timestamp);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Biztonsági Monitoring
          </h1>
          <p className="text-muted-foreground">
            Valós idejű biztonsági események és riasztások kezelése
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Frissítés
        </Button>
      </div>

      {/* Statisztikák */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Esemény</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.events_last_hour || 0} az elmúlt órában
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritikus Események</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.critical_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.high_events || 0} magas súlyosságú
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív Riasztások</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.total_alerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sent_alerts || 0} elküldve
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fenyegetések</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.threat_indicators || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.blocked_ips || 0} blokkolt IP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fő tartalom */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Események</TabsTrigger>
          <TabsTrigger value="alerts">Riasztások</TabsTrigger>
          <TabsTrigger value="threats">Fenyegetések</TabsTrigger>
          <TabsTrigger value="settings">Beállítások</TabsTrigger>
        </TabsList>

        {/* Események */}
        <TabsContent value="events" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Biztonsági Események
              </CardTitle>
              <CardDescription>
                Valós idejű biztonsági események listája és kezelése
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Szűrők */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="event-type">Esemény típus:</Label>
                  <Input
                    id="event-type"
                    placeholder="Minden típus"
                    value={filters.event_type}
                    onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="severity">Súlyosság:</Label>
                  <Input
                    id="severity"
                    placeholder="Minden súlyosság"
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="resolved">Feloldott:</Label>
                  <select
                    id="resolved"
                    value={filters.resolved === undefined ? "" : filters.resolved.toString()}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      resolved: e.target.value === "" ? undefined : e.target.value === "true" 
                    })}
                    className="w-32 px-3 py-2 border rounded-md"
                  >
                    <option value="">Minden</option>
                    <option value="false">Nem</option>
                    <option value="true">Igen</option>
                  </select>
                </div>
                <Button onClick={loadData} variant="outline" size="sm">
                  Szűrés
                </Button>
              </div>

              {/* Események listája */}
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {events.map((event) => (
                    <Card key={event.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                              {getEventTypeIcon(event.event_type)}
                              <Badge className={getSeverityColor(event.severity)}>
                                {event.severity.toUpperCase()}
                              </Badge>
                              {event.resolved && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{event.description}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Típus: {event.event_type}</div>
                                <div>IP: {event.ip_address}</div>
                                <div>Időpont: {formatTimestamp(event.timestamp)}</div>
                                {event.user_id && <div>Felhasználó: {event.user_id}</div>}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEvent(event)}
                            >
                              Részletek
                            </Button>
                            {!event.resolved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveEvent(event.id)}
                              >
                                Feloldás
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nincsenek biztonsági események
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Riasztások */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Biztonsági Riasztások
              </CardTitle>
              <CardDescription>
                Aktív és elküldött biztonsági riasztások
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className="border-orange-200 bg-orange-50">
                    <Bell className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line">
                      {alert.message}
                    </AlertDescription>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>Típus: {alert.alert_type}</div>
                      <div>Címzett: {alert.recipient}</div>
                      <div>Státusz: {alert.sent ? "Elküldve" : "Függőben"}</div>
                      {alert.sent_at && (
                        <div>Elküldve: {formatTimestamp(alert.sent_at)}</div>
                      )}
                    </div>
                  </Alert>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nincsenek aktív riasztások
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fenyegetések */}
        <TabsContent value="threats" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fenyegetési Indikátorok
              </CardTitle>
              <CardDescription>
                Detektált fenyegetések és blokkolt IP címek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIndicators.map((indicator) => (
                  <Card key={indicator.id} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{indicator.value}</div>
                            <div className="text-sm text-muted-foreground">
                              {indicator.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Típus: {indicator.indicator_type} | 
                              Szint: {indicator.threat_level} | 
                              Előfordulások: {indicator.occurrences}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={indicator.is_blocked ? "destructive" : "secondary"}>
                            {indicator.is_blocked ? "Blokkolt" : "Aktív"}
                          </Badge>
                          {indicator.indicator_type === "ip_address" && (
                            indicator.is_blocked ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnblockIP(indicator.value)}
                              >
                                Blokkolás feloldása
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleBlockIP(indicator.value)}
                              >
                                IP blokkolása
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {threatIndicators.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nincsenek fenyegetési indikátorok
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beállítások */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Monitoring Beállítások
              </CardTitle>
              <CardDescription>
                Biztonsági monitoring konfigurációja
              </CardDescription>
            </CardHeader>
            <CardContent>
              {config && (
                <div className="space-y-6">
                  {/* Valós idejű monitoring */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="real-time">Valós idejű monitoring</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatikus biztonsági esemény detektálás
                      </p>
                    </div>
                    <Switch
                      id="real-time"
                      checked={config.real_time_monitoring}
                      onCheckedChange={(checked) => 
                        updateConfig({ real_time_monitoring: checked })
                      }
                    />
                  </div>

                  <Separator />

                  {/* Riasztási küszöbök */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Riasztási Küszöbök</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="failed-logins">Sikertelen bejelentkezések/óra</Label>
                        <Input
                          id="failed-logins"
                          type="number"
                          value={config.alert_thresholds.failed_logins_per_hour}
                          onChange={(e) => updateConfig({
                            alert_thresholds: {
                              ...config.alert_thresholds,
                              failed_logins_per_hour: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="suspicious-ips">Gyanús IP címek/óra</Label>
                        <Input
                          id="suspicious-ips"
                          type="number"
                          value={config.alert_thresholds.suspicious_ips_per_hour}
                          onChange={(e) => updateConfig({
                            alert_thresholds: {
                              ...config.alert_thresholds,
                              suspicious_ips_per_hour: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="api-errors">API hibák/percek</Label>
                        <Input
                          id="api-errors"
                          type="number"
                          value={config.alert_thresholds.api_errors_per_minute}
                          onChange={(e) => updateConfig({
                            alert_thresholds: {
                              ...config.alert_thresholds,
                              api_errors_per_minute: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="encryption-failures">Titkosítási hibák/óra</Label>
                        <Input
                          id="encryption-failures"
                          type="number"
                          value={config.alert_thresholds.encryption_failures_per_hour}
                          onChange={(e) => updateConfig({
                            alert_thresholds: {
                              ...config.alert_thresholds,
                              encryption_failures_per_hour: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Riasztási csatornák */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Riasztási Csatornák</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-alerts">Email riasztások</Label>
                          <p className="text-sm text-muted-foreground">
                            Riasztások küldése emailben
                          </p>
                        </div>
                        <Switch
                          id="email-alerts"
                          checked={config.alert_channels.email_enabled}
                          onCheckedChange={(checked) => 
                            updateConfig({
                              alert_channels: {
                                ...config.alert_channels,
                                email_enabled: checked
                              }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-alerts">SMS riasztások</Label>
                          <p className="text-sm text-muted-foreground">
                            Riasztások küldése SMS-ben
                          </p>
                        </div>
                        <Switch
                          id="sms-alerts"
                          checked={config.alert_channels.sms_enabled}
                          onCheckedChange={(checked) => 
                            updateConfig({
                              alert_channels: {
                                ...config.alert_channels,
                                sms_enabled: checked
                              }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="webhook-alerts">Webhook riasztások</Label>
                          <p className="text-sm text-muted-foreground">
                            Riasztások küldése webhook-on keresztül
                          </p>
                        </div>
                        <Switch
                          id="webhook-alerts"
                          checked={config.alert_channels.webhook_enabled}
                          onCheckedChange={(checked) => 
                            updateConfig({
                              alert_channels: {
                                ...config.alert_channels,
                                webhook_enabled: checked
                              }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dashboard-alerts">Dashboard riasztások</Label>
                          <p className="text-sm text-muted-foreground">
                            Riasztások megjelenítése a dashboard-on
                          </p>
                        </div>
                        <Switch
                          id="dashboard-alerts"
                          checked={config.alert_channels.dashboard_enabled}
                          onCheckedChange={(checked) => 
                            updateConfig({
                              alert_channels: {
                                ...config.alert_channels,
                                dashboard_enabled: checked
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Automatikus feloldás */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-resolve">Automatikus esemény feloldás</Label>
                      <p className="text-sm text-muted-foreground">
                        Alacsony súlyosságú események automatikus feloldása
                      </p>
                    </div>
                    <Switch
                      id="auto-resolve"
                      checked={config.auto_resolution}
                      onCheckedChange={(checked) => 
                        updateConfig({ auto_resolution: checked })
                      }
                    />
                  </div>

                  {config.auto_resolution && (
                    <div>
                      <Label htmlFor="auto-resolve-delay">Automatikus feloldás késleltetése (óra)</Label>
                      <Input
                        id="auto-resolve-delay"
                        type="number"
                        value={config.auto_resolution_delay}
                        onChange={(e) => updateConfig({
                          auto_resolution_delay: parseInt(e.target.value)
                        })}
                        className="w-32"
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Adatmegőrzés */}
                  <div>
                    <Label htmlFor="retention-period">Adatmegőrzési időszak (nap)</Label>
                    <Input
                      id="retention-period"
                      type="number"
                      value={config.retention_period}
                      onChange={(e) => updateConfig({
                        retention_period: parseInt(e.target.value)
                      })}
                      className="w-32"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Biztonsági események és riasztások megőrzési ideje
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Esemény részletek modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getEventTypeIcon(selectedEvent.event_type)}
                Esemény Részletek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Típus</Label>
                  <div className="text-sm">{selectedEvent.event_type}</div>
                </div>
                <div>
                  <Label>Súlyosság</Label>
                  <Badge className={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>IP Cím</Label>
                  <div className="text-sm">{selectedEvent.ip_address}</div>
                </div>
                <div>
                  <Label>Időpont</Label>
                  <div className="text-sm">{formatTimestamp(selectedEvent.timestamp)}</div>
                </div>
                {selectedEvent.user_id && (
                  <div>
                    <Label>Felhasználó ID</Label>
                    <div className="text-sm">{selectedEvent.user_id}</div>
                  </div>
                )}
                <div>
                  <Label>User Agent</Label>
                  <div className="text-sm text-muted-foreground">{selectedEvent.user_agent}</div>
                </div>
              </div>
              
              <div>
                <Label>Leírás</Label>
                <div className="text-sm">{selectedEvent.description}</div>
              </div>

              {Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <Label>Metaadatok</Label>
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedEvent.resolved && (
                <div>
                  <Label htmlFor="resolution-notes">Feloldási megjegyzések</Label>
                  <Input
                    id="resolution-notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Opcionális megjegyzések..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Bezárás
                </Button>
                {!selectedEvent.resolved && (
                  <Button onClick={() => handleResolveEvent(selectedEvent.id)}>
                    Esemény feloldása
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
