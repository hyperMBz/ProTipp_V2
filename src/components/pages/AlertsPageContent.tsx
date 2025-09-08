"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LiveAlertsSystem } from '@/components/alerts/LiveAlertsSystem';
import { AlertHistoryList } from '@/components/alerts/AlertHistoryList';
import { NotificationSettings } from '@/components/alerts/NotificationSettings';
import { 
  Bell, 
  Settings, 
  History, 
  Mail, 
  Smartphone,
  Zap,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export function AlertsPageContent() {
  const [activeTab, setActiveTab] = useState('live');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Értesítések
          </h1>
          <p className="text-muted-foreground mt-2">
            Személyre szabott értesítések és alert beállítások
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Beállítások
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Új alert
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 az elmúlt napban
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ma küldött alerts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +12% az előző nappal szemben
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikeres értesítések</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">
              47/48 sikeres
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Átlagos válaszidő</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              Valós idejű értesítések
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Gyors beállítások</span>
          </CardTitle>
          <CardDescription>
            Alapvető értesítési beállítások
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-alerts" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email értesítések</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Arbitrage lehetőségek emailben
                </p>
              </div>
              <Switch
                id="email-alerts"
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="push-alerts" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Push értesítések</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Azonnali értesítések
                </p>
              </div>
              <Switch
                id="push-alerts"
                checked={pushAlerts}
                onCheckedChange={setPushAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sms-alerts" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>SMS értesítések</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Kritikus alerts SMS-ben
                </p>
              </div>
              <Switch
                id="sms-alerts"
                checked={smsAlerts}
                onCheckedChange={setSmsAlerts}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Élő alerts</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Beállítások</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Előzmények</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Sablonok</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Élő értesítések</span>
              </CardTitle>
              <CardDescription>
                Valós idejű arbitrage és value betting alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveAlertsSystem />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Értesítési beállítások</span>
              </CardTitle>
              <CardDescription>
                Részletes értesítési preferenciák
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings onRequestPermission={async () => true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Alert előzmények</span>
              </CardTitle>
              <CardDescription>
                Összes küldött értesítés és állapotuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertHistoryList alerts={[]} onAcknowledge={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Alert sablonok</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Arbitrage Alert</h4>
                      <p className="text-sm text-muted-foreground">Minimum 3% profit</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Value Betting Alert</h4>
                      <p className="text-sm text-muted-foreground">EV &gt; 5%</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Odds Change Alert</h4>
                      <p className="text-sm text-muted-foreground">&gt; 10% változás</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Új alert sablon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-name">Alert neve</Label>
                    <Input id="alert-name" placeholder="Új alert sablon" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alert-type">Alert típusa</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz típust" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arbitrage">Arbitrage</SelectItem>
                        <SelectItem value="value">Value Betting</SelectItem>
                        <SelectItem value="odds">Odds Change</SelectItem>
                        <SelectItem value="custom">Egyedi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Küszöbérték</Label>
                    <Input id="threshold" placeholder="5" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sport">Sport</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz sportot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Összes</SelectItem>
                        <SelectItem value="football">Futball</SelectItem>
                        <SelectItem value="basketball">Kosárlabda</SelectItem>
                        <SelectItem value="tennis">Tenisz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Alert sablon létrehozása
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Alert Segítség</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Alert típusok</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Arbitrage Alert:</strong> Garantiált profit lehetőségek</li>
                <li>• <strong>Value Betting Alert:</strong> Pozitív EV fogadások</li>
                <li>• <strong>Odds Change Alert:</strong> Jelentős odds változások</li>
                <li>• <strong>Custom Alert:</strong> Egyedi feltételek</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Értesítési módok</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Email:</strong> Részletes információk emailben</li>
                <li>• <strong>Push:</strong> Azonnali értesítések böngészőben</li>
                <li>• <strong>SMS:</strong> Kritikus alerts telefonon</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tippek</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Állíts be megfelelő küszöbértékeket a spam elkerülésére</li>
                <li>• Használj sport specifikus alerts-eket</li>
                <li>• Ellenőrizd rendszeresen az alert előzményeket</li>
                <li>• Teszteld az értesítési beállításokat</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
