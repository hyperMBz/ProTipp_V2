"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealTimeStatus, useApiUsage } from "@/lib/hooks/use-odds-data";
import { formatNumber } from "@/lib/utils";
import { 
  TrendingUp, 
  DollarSign, 
  Clock,
  Zap,
  Activity,
  BarChart3,
  Bell,
  Calculator,
  Target,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { useAuth } from "@/lib/auth/unified-auth-provider";
import Link from "next/link";

// Mock data for demonstration
const mockStats = {
  totalProfit: 125000,
  activeBets: 3,
  bestOpportunity: 8.7,
  apiStatus: true
};

const mockActiveBets = [
  {
    id: 1,
    event: "Manchester United vs Arsenal",
    profit: 4200,
    status: "active",
    timeLeft: "2h 15m"
  },
  {
    id: 2,
    event: "Lakers vs Warriors",
    profit: 2800,
    status: "pending",
    timeLeft: "1h 45m"
  },
  {
    id: 3,
    event: "Novak Djokovic vs Rafael Nadal",
    profit: 1800,
    status: "active",
    timeLeft: "3h 30m"
  }
];

const mockNotifications = [
  {
    id: 1,
    type: "success",
    message: "Új arbitrage lehetőség találva: 6.2% profit",
    time: "2 perc"
  },
  {
    id: 2,
    type: "warning",
    message: "API kapcsolat instabil",
    time: "5 perc"
  },
  {
    id: 3,
    type: "info",
    message: "Napi profit cél elérve: +15,000 Ft",
    time: "1 óra"
  }
];

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const { user, loading } = useAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // API hooks
  const { isRealTime, isDemo } = useRealTimeStatus();
  const apiUsage = useApiUsage();

  // Bejelentkezési ellenőrzés
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bejelentkezés szükséges</h1>
          <p className="text-muted-foreground">
            A dashboard megtekintéséhez be kell jelentkezned.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link href="/login">
                Bejelentkezés
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                Vissza a főoldalra
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case "info":
        return <Bell className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                ProTipp V2 Dashboard
              </h1>
              <Badge
                variant={isRealTimeActive ? "default" : "secondary"}
                className={isRealTimeActive ? "animate-pulse" : ""}
              >
                {isRealTimeActive ? "🟢 ÉLŐ" : "⏸️ SZÜNET"}
              </Badge>
              {isDemo && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  Demo mód
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {isRealTimeActive ? "Szünet" : "Indítás"}
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Összesített Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                +{formatNumber(mockStats.totalProfit)} Ft
              </div>
              <p className="text-xs text-muted-foreground">
                Napi profit
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktív Fogadások</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{mockStats.activeBets}</div>
              <p className="text-xs text-muted-foreground">
                Futó fogadások
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legjobb Lehetőség</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {mockStats.bestOpportunity}%
              </div>
              <p className="text-xs text-muted-foreground">
                Profit margin
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Kapcsolat</CardTitle>
              <ConnectionStatus isRealTime={isClient && isRealTime} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isClient && isRealTime ? 'text-green-400' : 'text-red-400'}`}>
                {isClient && isRealTime ? 'ÉLŐ' : 'OFFLINE'}
              </div>
              <p className="text-xs text-muted-foreground">
                {apiUsage.data ? `${apiUsage.data.requestsUsed}/${apiUsage.data.requestsRemaining} API hívás` : 'API státusz'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Gyors Műveletek</span>
              </CardTitle>
              <CardDescription>
                Gyakran használt funkciók
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/arbitrage">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Arbitrage Keresés
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              
              <Link href="/calculator">
                <Button className="w-full justify-start" variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Profit Kalkulátor
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              
              <Link href="/bet-tracker">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Fogadás Követés
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              
              <Link href="/alerts">
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Értesítések
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              
              <Link href="/analytics">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Részletes Elemzés
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Bets */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Aktív Fogadások</span>
                <Badge variant="outline">{mockActiveBets.length}</Badge>
              </CardTitle>
              <CardDescription>
                Futó fogadások és állapotuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActiveBets.map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(bet.status)}
                      <div>
                        <p className="font-medium">{bet.event}</p>
                        <p className="text-sm text-muted-foreground">
                          Hátralévő idő: {bet.timeLeft}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        +{formatNumber(bet.profit)} Ft
                      </p>
                      <Badge 
                        variant={bet.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {bet.status === 'active' ? 'Aktív' : 'Függőben'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Link href="/bet-tracker">
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Összes Fogadás Megtekintése
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Important Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Fontos Értesítések</span>
                <Badge variant="outline">{mockNotifications.length}</Badge>
              </CardTitle>
              <CardDescription>
                Kritikus információk és figyelmeztetések
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time} ezelőtt
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profit Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Profit Trend</span>
              </CardTitle>
              <CardDescription>
                Utolsó 7 nap teljesítménye
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Grafikon betöltése...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Részletes elemzés az Analytics oldalon
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/analytics">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Részletes Elemzés Megtekintése
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}