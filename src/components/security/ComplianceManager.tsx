/**
 * Compliance Manager UI Component
 * GDPR compliance, adatigénylések és hozzájárulások kezelése
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Download, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
  UserCheck,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { useAuth } from '@/lib/auth/unified-auth-provider';
import { 
  complianceManager, 
  DataRetentionPolicy,
  DataSubjectRequest,
  PrivacyConsent,
  DataProcessingActivity,
  ComplianceConfig 
} from '@/lib/security/compliance-manager';

export default function ComplianceManagerComponent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<ComplianceConfig | null>(null);
  const [report, setReport] = useState<any>(null);
  
  // Data Subject Request
  const [requestType, setRequestType] = useState<'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'>('access');
  const [requestDescription, setRequestDescription] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [userRequests, setUserRequests] = useState<DataSubjectRequest[]>([]);
  
  // Data Export
  const [exportDataTypes, setExportDataTypes] = useState<string[]>([]);
  const [exportData, setExportData] = useState<any>(null);
  
  // Privacy Consent
  const [consentType, setConsentType] = useState<'marketing' | 'analytics' | 'necessary' | 'third_party'>('marketing');
  const [consentGranted, setConsentGranted] = useState(true);
  const [userConsents, setUserConsents] = useState<PrivacyConsent[]>([]);

  const availableDataTypes = [
    'personal_data',
    'activity_data', 
    'consent_data',
    'api_keys',
    'betting_data',
    'analytics_data'
  ];

  const consentTypes = [
    { value: 'marketing', label: 'Marketing hozzájárulás' },
    { value: 'analytics', label: 'Analitikai hozzájárulás' },
    { value: 'necessary', label: 'Szükséges hozzájárulás' },
    { value: 'third_party', label: 'Harmadik fél hozzájárulás' }
  ];

  useEffect(() => {
    if (user) {
      loadConfig();
      loadUserRequests();
      loadUserConsents();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const currentConfig = complianceManager.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Config load error:', error);
    }
  };

  const loadUserRequests = async () => {
    if (!user) return;
    
    try {
      const requests = await complianceManager.getUserDataSubjectRequests(user.id);
      setUserRequests(requests);
    } catch (error) {
      console.error('Load user requests error:', error);
    }
  };

  const loadUserConsents = async () => {
    if (!user) return;
    
    try {
      const consents = await complianceManager.getUserConsents(user.id);
      setUserConsents(consents);
    } catch (error) {
      console.error('Load user consents error:', error);
    }
  };

  const createDataSubjectRequest = async () => {
    if (!user || !requestDescription.trim()) {
      setError('Kérjük, adjon meg leírást az adatigényléshez');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const request = await complianceManager.createDataSubjectRequest({
        user_id: user.id,
        request_type: requestType,
        status: 'pending',
        description: requestDescription,
        requested_data_types: selectedDataTypes
      });

      setSuccess('Adatigénylés sikeresen létrehozva');
      setRequestDescription('');
      setSelectedDataTypes([]);
      
      // Reload requests
      await loadUserRequests();
    } catch (error) {
      setError('Adatigénylés létrehozás sikertelen');
      console.error('Data subject request creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDataExport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const exportData = await complianceManager.generateDataExport(user.id, exportDataTypes);
      setExportData(exportData);
      setSuccess('Adatexport sikeresen generálva');
    } catch (error) {
      setError('Adatexport generálás sikertelen');
      console.error('Data export generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserData = async () => {
    if (!user) return;

    if (!confirm('Biztosan törölni szeretné az adatait? Ez a művelet nem vonható vissza!')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await complianceManager.deleteUserData(user.id, exportDataTypes);
      setSuccess('Adatok sikeresen törölve');
      setExportData(null);
    } catch (error) {
      setError('Adatok törlése sikertelen');
      console.error('Data deletion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const manageConsent = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const consent = await complianceManager.manageConsent({
        user_id: user.id,
        consent_type: consentType,
        granted: consentGranted,
        granted_at: new Date(),
        ip_address: '127.0.0.1', // TODO: Get real IP
        user_agent: navigator.userAgent,
        consent_version: config?.privacy_policy_version || '1.0.0'
      });

      setSuccess(`Hozzájárulás sikeresen ${consentGranted ? 'megadva' : 'visszavonva'}`);
      
      // Reload consents
      await loadUserConsents();
    } catch (error) {
      setError('Hozzájárulás kezelés sikertelen');
      console.error('Consent management error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await complianceManager.generateComplianceReport();
      setReport(report);
      setSuccess('Compliance jelentés sikeresen generálva');
    } catch (error) {
      setError('Compliance jelentés generálás sikertelen');
      console.error('Compliance report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Szöveg másolva a vágólapra');
  };

  const downloadExportData = () => {
    if (!exportData) return;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleDataType = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const toggleExportDataType = (dataType: string) => {
    setExportDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const getRequestTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'access': 'bg-blue-500',
      'rectification': 'bg-yellow-500',
      'erasure': 'bg-red-500',
      'portability': 'bg-green-500',
      'restriction': 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getRequestStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500',
      'processing': 'bg-blue-500',
      'completed': 'bg-green-500',
      'rejected': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getConsentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'marketing': 'bg-purple-500',
      'analytics': 'bg-blue-500',
      'necessary': 'bg-green-500',
      'third_party': 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-5 w-5" />
            GDPR Compliance Kezelés
          </CardTitle>
          <CardDescription>
            Adatigénylések, hozzájárulások és compliance jelentések kezelése
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="requests">Adatigénylések</TabsTrigger>
              <TabsTrigger value="export">Adatexport</TabsTrigger>
              <TabsTrigger value="consents">Hozzájárulások</TabsTrigger>
              <TabsTrigger value="report">Jelentés</TabsTrigger>
              <TabsTrigger value="config">Beállítások</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              {/* Create Data Subject Request */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Új Adatigénylés
                  </CardTitle>
                  <CardDescription>
                    Kérjen adatokat vagy módosítsa azokat GDPR alapján
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requestType">Igénylés típusa</Label>
                      <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="access">Adathozzáférés</SelectItem>
                          <SelectItem value="rectification">Adatmódosítás</SelectItem>
                          <SelectItem value="erasure">Adattörlés</SelectItem>
                          <SelectItem value="portability">Adathordozhatóság</SelectItem>
                          <SelectItem value="restriction">Adatfeldolgozás korlátozása</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requestDescription">Leírás</Label>
                    <Textarea
                      id="requestDescription"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      placeholder="Írja le részletesen az adatigénylését..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Kért adattípusok</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableDataTypes.map((dataType) => (
                        <div key={dataType} className="flex items-center space-x-2">
                          <Checkbox
                            id={dataType}
                            checked={selectedDataTypes.includes(dataType)}
                            onCheckedChange={() => toggleDataType(dataType)}
                          />
                          <Label htmlFor={dataType} className="text-sm">
                            {dataType.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createDataSubjectRequest} 
                    disabled={loading || !requestDescription.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Adatigénylés Létrehozása
                  </Button>
                </CardContent>
              </Card>

              {/* User Requests List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adatigénylések</CardTitle>
                  <CardDescription>
                    Az Ön adatigénylései
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRequests.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nincsenek adatigénylések.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {userRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {request.request_type === 'access' ? 'Adathozzáférés' :
                                   request.request_type === 'rectification' ? 'Adatmódosítás' :
                                   request.request_type === 'erasure' ? 'Adattörlés' :
                                   request.request_type === 'portability' ? 'Adathordozhatóság' :
                                   'Adatfeldolgozás korlátozása'}
                                </span>
                                <Badge className={getRequestTypeColor(request.request_type)}>
                                  {request.request_type}
                                </Badge>
                                <Badge className={getRequestStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {request.description}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Létrehozva: {request.created_at.toLocaleDateString()}
                                {request.completed_at && (
                                  <span className="ml-2">
                                    Befejezve: {request.completed_at.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Adatexport és Törlés
                  </CardTitle>
                  <CardDescription>
                    Exportálja vagy törölje adatait GDPR alapján
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Exportálandó adattípusok</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableDataTypes.map((dataType) => (
                        <div key={dataType} className="flex items-center space-x-2">
                          <Checkbox
                            id={`export-${dataType}`}
                            checked={exportDataTypes.includes(dataType)}
                            onCheckedChange={() => toggleExportDataType(dataType)}
                          />
                          <Label htmlFor={`export-${dataType}`} className="text-sm">
                            {dataType.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={generateDataExport} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Adatexport Generálása
                    </Button>
                    
                    <Button 
                      onClick={deleteUserData} 
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Adatok Törlése
                    </Button>
                  </div>

                  {exportData && (
                    <div className="space-y-2">
                      <Label>Exportált adatok</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <pre className="text-sm break-all">
                          {JSON.stringify(exportData, null, 2)}
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={downloadExportData}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Letöltés
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(exportData))}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Másolás
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Hozzájárulások Kezelése
                  </CardTitle>
                  <CardDescription>
                    Adatvédelmi hozzájárulások kezelése
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consentType">Hozzájárulás típusa</Label>
                      <Select value={consentType} onValueChange={(value: any) => setConsentType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {consentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Hozzájárulás állapota</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consentGranted"
                          checked={consentGranted}
                          onCheckedChange={(checked) => setConsentGranted(checked as boolean)}
                        />
                        <Label htmlFor="consentGranted">
                          {consentGranted ? 'Hozzájárulás megadása' : 'Hozzájárulás visszavonása'}
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={manageConsent} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    Hozzájárulás {consentGranted ? 'Megadása' : 'Visszavonása'}
                  </Button>
                </CardContent>
              </Card>

              {/* User Consents List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aktív Hozzájárulások</CardTitle>
                  <CardDescription>
                    Az Ön adatvédelmi hozzájárulásai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userConsents.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nincsenek hozzájárulások.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {userConsents.map((consent) => (
                        <div
                          key={consent.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <UserCheck className="h-4 w-4" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {consentTypes.find(t => t.value === consent.consent_type)?.label || consent.consent_type}
                                </span>
                                <Badge className={getConsentTypeColor(consent.consent_type)}>
                                  {consent.consent_type}
                                </Badge>
                                <Badge variant={consent.granted ? "default" : "secondary"}>
                                  {consent.granted ? 'Aktív' : 'Visszavonva'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Megadva: {consent.granted_at.toLocaleDateString()}
                                {consent.revoked_at && (
                                  <span className="ml-2">
                                    Visszavonva: {consent.revoked_at.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Compliance Jelentés
                  </CardTitle>
                  <CardDescription>
                    GDPR compliance állapot és statisztikák
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={generateComplianceReport} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Compliance Jelentés Generálása
                  </Button>

                  {report && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold">
                            {report.gdpr_compliance.data_retention_policies.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Megőrzési politikák</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold">
                            {report.gdpr_compliance.data_processing_activities.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Feldolgozási tevékenységek</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {report.gdpr_compliance.active_consents}
                          </div>
                          <div className="text-sm text-muted-foreground">Aktív hozzájárulások</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {report.gdpr_compliance.pending_requests}
                          </div>
                          <div className="text-sm text-muted-foreground">Függő kérések</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Teljes jelentés</Label>
                        <div className="p-3 bg-muted rounded-md">
                          <pre className="text-sm break-all">
                            {JSON.stringify(report, null, 2)}
                          </pre>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(report))}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Jelentés Másolása
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Compliance Beállítások
                  </CardTitle>
                  <CardDescription>
                    GDPR compliance konfiguráció megtekintése
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {config ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">GDPR Engedélyezve</div>
                          <div className="text-sm text-muted-foreground">
                            {config.gdpr_enabled ? 'Igen' : 'Nem'}
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Alapértelmezett Megőrzési Idő</div>
                          <div className="text-sm text-muted-foreground">
                            {config.default_retention_period} nap
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Hozzájárulás Kötelező</div>
                          <div className="text-sm text-muted-foreground">
                            {config.consent_required ? 'Igen' : 'Nem'}
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Adatexport Engedélyezve</div>
                          <div className="text-sm text-muted-foreground">
                            {config.data_export_enabled ? 'Igen' : 'Nem'}
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Adattörlés Engedélyezve</div>
                          <div className="text-sm text-muted-foreground">
                            {config.data_deletion_enabled ? 'Igen' : 'Nem'}
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Adatvédelmi Irányelv</div>
                          <div className="text-sm text-muted-foreground">
                            v{config.privacy_policy_version}
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
