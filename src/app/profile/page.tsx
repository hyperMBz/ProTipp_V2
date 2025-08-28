"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/lib/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Settings, DollarSign, Bell, Shield, CreditCard, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useBetHistoryStats } from "@/lib/hooks/use-bet-history";
import { DebugAuth } from "@/components/DebugAuth";
import { checkAuthSession, refreshAuthSession } from "@/lib/auth-recovery";

export default function ProfilePage() {
  const user = useUser();
  const { updateProfile, loading: authLoading } = useAuth();
  const statsQuery = useBetHistoryStats();

  // Debug logging
  console.log('🏠 Profile Page - User:', user?.email || 'No user');
  console.log('🏠 Profile Page - Auth Loading:', authLoading);
  console.log('🏠 Profile Page - User ID:', user?.id || 'No ID');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    bankroll: 1000000,
    timezone: 'Europe/Budapest',
    currency: 'HUF'
  });

  // Settings state
  const [settings, setSettings] = useState({
    auto_refresh: true,
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    arbitrage_alerts: true,
    ev_alerts: true,
    min_profit_threshold: 2.0
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        bankroll: 1000000, // This would come from profile table
        timezone: 'Europe/Budapest',
        currency: 'HUF'
      });
    }
  }, [user]);

  // Session recovery mechanism
  useEffect(() => {
    const recoverSession = async () => {
      if (!user && !authLoading) {
        console.log('🔄 Profile page: No user, attempting session recovery...');
        const session = await checkAuthSession();

        if (!session) {
          console.log('🔄 Profile page: No session found, trying to refresh...');
          // Skipping refresh to avoid AuthSessionMissingError
          console.log('⚠️ Profile page: Would attempt refresh but skipping to avoid errors');
        }
      }
    };

    recoverSession();
  }, [user, authLoading]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await updateProfile({
        full_name: profileData.full_name,
      });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Profil sikeresen frissítve!' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Hiba történt a profil frissítése során';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (profileData.full_name) {
      return profileData.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getSubscriptionBadge = () => {
    return (
      <Badge variant="secondary" className="text-xs">
        Ingyenes csomag
      </Badge>
    );
  };

  // Loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Betöltés...</CardTitle>
            <CardDescription>
              Profil adatok betöltése
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Bejelentkezés szükséges</CardTitle>
            <CardDescription>
              A profil megtekintéséhez be kell jelentkezned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Vissza a főoldalra
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={profileData.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profileData.full_name || 'Felhasználó'}</h1>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getSubscriptionBadge()}
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Profilkép módosítása
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <DebugAuth />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="gradient-bg border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-sm text-muted-foreground">Bankroll</div>
                  <div className="text-xl font-bold text-green-400">
                    {formatNumber(profileData.bankroll)} Ft
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Összes fogadás</div>
                  <div className="text-xl font-bold text-primary">
                    {statsQuery.data?.total_bets || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-muted-foreground">Összes profit</div>
                  <div className={`text-xl font-bold ${(statsQuery.data?.total_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(statsQuery.data?.total_profit || 0) >= 0 ? '+' : ''}{formatNumber(statsQuery.data?.total_profit || 0)} Ft
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-sm text-muted-foreground">Nyerési ráta</div>
                  <div className="text-xl font-bold text-blue-400">
                    {(statsQuery.data?.win_rate || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="settings">Beállítások</TabsTrigger>
            <TabsTrigger value="notifications">Értesítések</TabsTrigger>
            <TabsTrigger value="subscription">Előfizetés</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Személyes adatok</span>
                </CardTitle>
                <CardDescription>
                  Módosítsd a személyes adataidat és a bankroll beállításokat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Teljes név</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email cím</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled={true}
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Az email cím nem módosítható
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankroll">Bankroll (Ft)</Label>
                      <Input
                        id="bankroll"
                        type="number"
                        value={profileData.bankroll}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bankroll: parseInt(e.target.value) || 0 }))}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Pénznem</Label>
                      <Select value={profileData.currency} onValueChange={(value) => setProfileData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HUF">HUF (Magyar Forint)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Időzóna</Label>
                      <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Budapest">Europe/Budapest</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Mentés...' : 'Változások mentése'}
                  </Button>
                </form>

                {/* Messages */}
                {message && (
                  <Alert className={`mt-4 ${message.type === 'success' ? 'border-green-500/50 text-green-700 bg-green-50/10' : ''}`} variant={message.type === 'error' ? 'destructive' : 'default'}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Alkalmazás beállítások</span>
                </CardTitle>
                <CardDescription>
                  Testreszabhatod az alkalmazás működését
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Automatikus frissítés</Label>
                    <p className="text-sm text-muted-foreground">
                      Az odds-ok automatikus frissítése a háttérben
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_refresh}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_refresh: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Arbitrage beállítások</h4>

                  <div className="space-y-2">
                    <Label htmlFor="min_profit">Minimális profit margin (%)</Label>
                    <Input
                      id="min_profit"
                      type="number"
                      step="0.1"
                      value={settings.min_profit_threshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, min_profit_threshold: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Értesítési beállítások</span>
                </CardTitle>
                <CardDescription>
                  Szabályozd, hogy milyen értesítéseket kapsz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Arbitrage lehetőségek emailben
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push értesítések</Label>
                    <p className="text-sm text-muted-foreground">
                      Azonnali értesítések a böngészőben
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push_notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Arbitrage riasztások</Label>
                    <p className="text-sm text-muted-foreground">
                      Értesítés új arbitrage lehetőségekről
                    </p>
                  </div>
                  <Switch
                    checked={settings.arbitrage_alerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, arbitrage_alerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>EV riasztások</Label>
                    <p className="text-sm text-muted-foreground">
                      Értesítés pozitív EV lehetőségekről
                    </p>
                  </div>
                  <Switch
                    checked={settings.ev_alerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ev_alerts: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Előfizetés kezelése</span>
                </CardTitle>
                <CardDescription>
                  Jelenlegi csomagod és billing információk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Ingyenes csomag</h4>
                      <p className="text-sm text-muted-foreground">
                        Alapvető arbitrage funkciók
                      </p>
                    </div>
                    <Badge variant="secondary">Aktív</Badge>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Frissíts Pro vagy Premium csomagra több funkcióért és korlátlan hozzáférésért.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-4">
                    <Button>Frissítés Pro-ra</Button>
                    <Button variant="outline">Csomagok megtekintése</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
