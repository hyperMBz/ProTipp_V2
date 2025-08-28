"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  BellRing,
  Smartphone,
  Mail,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface NotificationSettingsProps {
  onRequestPermission: () => Promise<boolean>;
}

export function NotificationSettings({ onRequestPermission }: NotificationSettingsProps) {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    const granted = await onRequestPermission();
    if (granted) {
      setBrowserPermission('granted');
      setPushEnabled(true);
    }
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ProTipp V2 Test', {
        body: 'Ez egy teszt értesítés! Ha látod, minden rendben működik. 🎉',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false
      });

      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    }
  };

  const getPermissionStatus = () => {
    switch (browserPermission) {
      case 'granted':
        return {
          status: 'Engedélyezve',
          color: 'text-green-400',
          icon: <CheckCircle className="h-4 w-4 text-green-400" />
        };
      case 'denied':
        return {
          status: 'Letiltva',
          color: 'text-red-400',
          icon: <AlertTriangle className="h-4 w-4 text-red-400" />
        };
      default:
        return {
          status: 'Nem beállított',
          color: 'text-yellow-400',
          icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />
        };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="space-y-6">
      {/* Browser Notifications */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <span>Böngésző értesítések</span>
          </CardTitle>
          <CardDescription>
            Push értesítések közvetlenül a böngészőbe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Push értesítések</Label>
              <div className="flex items-center space-x-2">
                {permissionStatus.icon}
                <span className={`text-sm ${permissionStatus.color}`}>
                  {permissionStatus.status}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {browserPermission === 'granted' ? (
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={setPushEnabled}
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestBrowserPermission}
                  disabled={browserPermission === 'denied'}
                >
                  Engedély kérése
                </Button>
              )}
            </div>
          </div>

          {browserPermission === 'denied' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Az értesítések le vannak tiltva. Engedélyezd őket a böngésző beállításaiban.
                <br />
                <strong>Chrome:</strong> Beállítások → Adatvédelem és biztonság → Webhelyek beállításai → Értesítések
              </AlertDescription>
            </Alert>
          )}

          {browserPermission === 'granted' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                disabled={!pushEnabled}
              >
                <Bell className="h-4 w-4 mr-2" />
                Teszt értesítés
              </Button>

              {testNotificationSent && (
                <Badge variant="outline" className="border-green-400 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Elküldve!
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Email értesítések</span>
          </CardTitle>
          <CardDescription>
            Arbitrage lehetőségek emailben (hamarosan)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email alerts</Label>
              <p className="text-sm text-muted-foreground">
                Napi összefoglaló és kritikus alertek emailben
              </p>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              disabled={true} // Disabled for now
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Email értesítések hamarosan elérhetők lesznek. Jelenleg a böngésző értesítések aktívak.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <span>Hang beállítások</span>
          </CardTitle>
          <CardDescription>
            Audio jelzések az értesítésekhez
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hang értesítések</Label>
              <p className="text-sm text-muted-foreground">
                Hangjelzés amikor új arbitrage lehetőség érkezik
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {soundEnabled && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Play test sound
                  try {
                    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                  } catch (error) {
                    console.error('Could not play test sound:', error);
                  }
                }}
              >
                🔊 Teszt hang
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellRing className="h-5 w-5 text-primary" />
            <span>Speciális beállítások</span>
          </CardTitle>
          <CardDescription>
            További testreszabási lehetőségek
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Csak magas prioritású alertek</Label>
              <p className="text-sm text-muted-foreground">
                Csak kritikus és magas prioritású arbitrage lehetőségekről értesítés
              </p>
            </div>
            <Switch
              checked={highPriorityOnly}
              onCheckedChange={setHighPriorityOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Prioritási szintek</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">KRITIKUS</Badge>
                <span className="text-muted-foreground">10%+ profit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">MAGAS</Badge>
                <span className="text-muted-foreground">5-10% profit vagy hamarosan lejár</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">KÖZEPES</Badge>
                <span className="text-muted-foreground">3-5% profit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">ALACSONY</Badge>
                <span className="text-muted-foreground">1-3% profit</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle>Értesítések összefoglalója</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aktív értesítési módok:</Label>
              <div className="space-y-1">
                {pushEnabled && browserPermission === 'granted' && (
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Push értesítések
                  </Badge>
                )}
                {soundEnabled && (
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Hang jelzések
                  </Badge>
                )}
                {emailEnabled && (
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    <Mail className="h-3 w-3 mr-1" />
                    Email (hamarosan)
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beállítások:</Label>
              <div className="space-y-1">
                {highPriorityOnly && (
                  <Badge variant="outline" className="border-orange-400 text-orange-400">
                    Csak magas prioritás
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary text-primary">
                  Valós idejű figyelés
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
