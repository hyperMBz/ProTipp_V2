"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Key,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    arbitrage: true,
    performance: true,
    security: true
  });

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+36 30 123 4567',
    location: 'Budapest, Magyarország',
    joinDate: '2024. január 15.',
    subscription: 'Premium'
  });

  const handleSave = () => {
    // Save settings logic
    console.log('Settings saved');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Beállítások
          </h1>
          <p className="text-muted-foreground text-lg">
            Személyre szabd a ProTipp V2 platformot
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Adatok Exportálása
          </Button>
          
          <Button size="sm" onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Mentés
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Értesítések</TabsTrigger>
          <TabsTrigger value="security">Biztonság</TabsTrigger>
          <TabsTrigger value="preferences">Beállítások</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil Információk
                </CardTitle>
                <CardDescription>
                  Személyes adatok és kapcsolattartási információk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Teljes név</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Teljes név"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email cím</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      placeholder="email@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonszám</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+36 30 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Helyszín</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      placeholder="Budapest, Magyarország"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fiók Információk
                </CardTitle>
                <CardDescription>
                  Fiók részletek és előfizetési információk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Csatlakozás dátuma</p>
                      <p className="text-sm text-muted-foreground">{profile.joinDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Előfizetés</p>
                      <p className="text-sm text-muted-foreground">{profile.subscription}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Módosítás
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="current-password">Jelenlegi jelszó</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Jelenlegi jelszó"
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Új jelszó</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Új jelszó"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Jelszó megerősítése</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Jelszó megerősítése"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Értesítési Beállítások
              </CardTitle>
              <CardDescription>
                Konfiguráld, hogyan szeretnél értesítéseket kapni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Értesítési Csatornák</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications">Email értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Email értesítések küldése
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications">Push értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Böngésző push értesítések
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sms-notifications">SMS értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      SMS értesítések küldése
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Értesítés Típusok</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="arbitrage-notifications">Arbitrage lehetőségek</Label>
                    <p className="text-sm text-muted-foreground">
                      Értesítés új arbitrage lehetőségekről
                    </p>
                  </div>
                  <Switch
                    id="arbitrage-notifications"
                    checked={notifications.arbitrage}
                    onCheckedChange={(checked) => setNotifications({...notifications, arbitrage: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="performance-notifications">Teljesítmény értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Értesítés teljesítmény változásokról
                    </p>
                  </div>
                  <Switch
                    id="performance-notifications"
                    checked={notifications.performance}
                    onCheckedChange={(checked) => setNotifications({...notifications, performance: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="security-notifications">Biztonsági értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Értesítés biztonsági eseményekről
                    </p>
                  </div>
                  <Switch
                    id="security-notifications"
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Settings */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Biztonsági Beállítások
                </CardTitle>
                <CardDescription>
                  Fiók biztonsági beállítások
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="two-factor">Kétfaktoros hitelesítés</Label>
                    <p className="text-sm text-muted-foreground">
                      További biztonság a fiókodhoz
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="login-alerts">Bejelentkezési értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Értesítés új bejelentkezésekről
                    </p>
                  </div>
                  <Switch id="login-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="session-timeout">Automatikus kijelentkezés</Label>
                    <p className="text-sm text-muted-foreground">
                      Kijelentkezés inaktivitás után
                    </p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Adatvédelem
                </CardTitle>
                <CardDescription>
                  Adatvédelmi beállítások
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="data-sharing">Adatmegosztás</Label>
                    <p className="text-sm text-muted-foreground">
                      Anonim adatok megosztása fejlesztéshez
                    </p>
                  </div>
                  <Switch id="data-sharing" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Használati analytics gyűjtése
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="marketing">Marketing értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Marketing és promóciós üzenetek
                    </p>
                  </div>
                  <Switch id="marketing" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="gradient-bg border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Trash2 className="h-5 w-5" />
                Veszélyes Zóna
              </CardTitle>
              <CardDescription>
                Végleges műveletek a fiókoddal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                <div>
                  <p className="font-medium text-red-400">Fiók törlése</p>
                  <p className="text-sm text-muted-foreground">
                    Véglegesen törli a fiókodat és az összes adatot
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Fiók Törlése
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Display Settings */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Megjelenés
                </CardTitle>
                <CardDescription>
                  Megjelenési beállítások
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Téma</Label>
                  <Select defaultValue="dark">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Világos</SelectItem>
                      <SelectItem value="dark">Sötét</SelectItem>
                      <SelectItem value="system">Rendszer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Nyelv</Label>
                  <Select defaultValue="hu">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hu">Magyar</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Pénznem</Label>
                  <Select defaultValue="EUR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="HUF">HUF (Ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Application Settings */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Alkalmazás Beállítások
                </CardTitle>
                <CardDescription>
                  Alkalmazás működési beállítások
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-refresh">Automatikus frissítés</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatikus adatok frissítése
                    </p>
                  </div>
                  <Switch id="auto-refresh" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sound-effects">Hanghatások</Label>
                    <p className="text-sm text-muted-foreground">
                      Hanghatások engedélyezése
                    </p>
                  </div>
                  <Switch id="sound-effects" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="animations">Animációk</Label>
                    <p className="text-sm text-muted-foreground">
                      UI animációk engedélyezése
                    </p>
                  </div>
                  <Switch id="animations" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
