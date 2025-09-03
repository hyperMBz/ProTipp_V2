"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  Shield,
  Eye
} from "lucide-react";
import { useAuth } from "@/lib/providers/auth-provider";
import { auditManager, AuditLog, AuditFilter } from "@/lib/security/audit-manager";

interface AuditLogViewerProps {
  className?: string;
}

export default function AuditLogViewer({ className }: AuditLogViewerProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AuditFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user, filters, currentPage]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const result = await auditManager.getAuditLogs(filters, pageSize, offset);
      setLogs(result.logs);
      setTotalLogs(result.total);
    } catch (error) {
      console.error("Audit logs loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setFilters(prev => ({ ...prev, action: searchTerm }));
    } else {
      setFilters(prev => ({ ...prev, action: undefined }));
    }
    setCurrentPage(1);
  };

  const handleExport = async (format: 'json' | 'csv' | 'xml') => {
    try {
      const data = await auditManager.exportAuditLogs(filters, format);
      
      // Create and download file
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 'application/xml' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <User className="h-4 w-4" />;
    if (action.includes('create')) return <Activity className="h-4 w-4" />;
    if (action.includes('update')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('delete')) return <XCircle className="h-4 w-4" />;
    if (action.includes('export')) return <Download className="h-4 w-4" />;
    if (action.includes('security')) return <Shield className="h-4 w-4" />;
    if (action.includes('api')) return <Globe className="h-4 w-4" />;
    if (action.includes('data')) return <Database className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 text-white';
      case 'failure': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
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

  const totalPages = Math.ceil(totalLogs / pageSize);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Audit Log Viewer
          </h1>
          <p className="text-muted-foreground">
            Biztonsági események és felhasználói műveletek naplózása
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            JSON Export
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
          <Button variant="outline" onClick={() => handleExport('xml')}>
            <Download className="h-4 w-4 mr-2" />
            XML Export
          </Button>
        </div>
      </div>

      {/* Szűrők */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Szűrők
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Keresés</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  placeholder="Művelet keresése..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="resource-type">Erőforrás típus</Label>
              <select
                id="resource-type"
                value={filters.resource_type || ""}
                onChange={(e) => handleFilterChange('resource_type', e.target.value || undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Minden típus</option>
                <option value="user">Felhasználó</option>
                <option value="betting">Fogadás</option>
                <option value="security">Biztonság</option>
                <option value="system">Rendszer</option>
                <option value="api">API</option>
                <option value="data">Adat</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>

            <div>
              <Label htmlFor="action-type">Művelet típus</Label>
              <select
                id="action-type"
                value={filters.action_type || ""}
                onChange={(e) => handleFilterChange('action_type', e.target.value || undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Minden művelet</option>
                <option value="create">Létrehozás</option>
                <option value="read">Olvasás</option>
                <option value="update">Frissítés</option>
                <option value="delete">Törlés</option>
                <option value="login">Bejelentkezés</option>
                <option value="logout">Kijelentkezés</option>
                <option value="export">Export</option>
                <option value="import">Import</option>
                <option value="block">Blokkolás</option>
                <option value="unblock">Blokkolás feloldása</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Státusz</Label>
              <select
                id="status"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Minden státusz</option>
                <option value="success">Sikeres</option>
                <option value="failure">Sikertelen</option>
                <option value="pending">Függőben</option>
                <option value="cancelled">Törölve</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logok */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logok ({totalLogs} összesen)
          </CardTitle>
          <CardDescription>
            Biztonsági események és felhasználói műveletek listája
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.map((log) => (
                <Card key={log.id} className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <Badge className={getStatusColor(log.status)}>
                            {log.status.toUpperCase()}
                          </Badge>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Erőforrás: {log.resource_type} {log.resource_id && `(${log.resource_id})`}</div>
                            <div>IP: {log.ip_address}</div>
                            <div>Időpont: {formatTimestamp(log.timestamp)}</div>
                            {log.user_id && <div>Felhasználó: {log.user_id}</div>}
                            {log.duration_ms && <div>Időtartam: {log.duration_ms}ms</div>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {logs.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nincsenek audit logok
                </div>
              )}
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Betöltés...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Lapozás */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalLogs)} / {totalLogs} log
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Előző
                </Button>
                <span className="px-3 py-2 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Következő
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log részletek modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getActionIcon(selectedLog.action)}
                Audit Log Részletek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Művelet</Label>
                  <div className="text-sm font-medium">{selectedLog.action}</div>
                </div>
                <div>
                  <Label>Státusz</Label>
                  <Badge className={getStatusColor(selectedLog.status)}>
                    {selectedLog.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Súlyosság</Label>
                  <Badge className={getSeverityColor(selectedLog.severity)}>
                    {selectedLog.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Erőforrás típus</Label>
                  <div className="text-sm">{selectedLog.resource_type}</div>
                </div>
                <div>
                  <Label>IP Cím</Label>
                  <div className="text-sm">{selectedLog.ip_address}</div>
                </div>
                <div>
                  <Label>Időpont</Label>
                  <div className="text-sm">{formatTimestamp(selectedLog.timestamp)}</div>
                </div>
                {selectedLog.user_id && (
                  <div>
                    <Label>Felhasználó ID</Label>
                    <div className="text-sm">{selectedLog.user_id}</div>
                  </div>
                )}
                {selectedLog.session_id && (
                  <div>
                    <Label>Session ID</Label>
                    <div className="text-sm">{selectedLog.session_id}</div>
                  </div>
                )}
                {selectedLog.duration_ms && (
                  <div>
                    <Label>Időtartam</Label>
                    <div className="text-sm">{selectedLog.duration_ms}ms</div>
                  </div>
                )}
                {selectedLog.response_status && (
                  <div>
                    <Label>HTTP Státusz</Label>
                    <div className="text-sm">{selectedLog.response_status}</div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Label>User Agent</Label>
                <div className="text-sm text-muted-foreground">{selectedLog.user_agent}</div>
              </div>

              {selectedLog.request_method && (
                <div>
                  <Label>HTTP Módszer</Label>
                  <div className="text-sm">{selectedLog.request_method}</div>
                </div>
              )}

              {selectedLog.request_path && (
                <div>
                  <Label>Kérés útvonala</Label>
                  <div className="text-sm">{selectedLog.request_path}</div>
                </div>
              )}

              {selectedLog.request_body && (
                <div>
                  <Label>Kérés törzse</Label>
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto max-h-32">
                    {selectedLog.request_body}
                  </pre>
                </div>
              )}

              {selectedLog.response_body && (
                <div>
                  <Label>Válasz törzse</Label>
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto max-h-32">
                    {selectedLog.response_body}
                  </pre>
                </div>
              )}

              {selectedLog.error_message && (
                <div>
                  <Label>Hibaüzenet</Label>
                  <div className="text-sm text-red-500">{selectedLog.error_message}</div>
                </div>
              )}

              {Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label>Metaadatok</Label>
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.tags.length > 0 && (
                <div>
                  <Label>Címkék</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedLog.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Bezárás
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
