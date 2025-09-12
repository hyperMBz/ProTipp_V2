"use client";

import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { TouchOptimizedTable } from "@/components/mobile/TouchOptimizedTable";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { DataSaver } from "@/components/mobile/DataSaver";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Zap,
  Settings,
  Download,
  Upload
} from "lucide-react";
import { useDeviceInfo, usePWAStatus, useOfflineStatus } from "@/lib/hooks/use-mobile";
import { MobileResponsiveTest } from "@/components/mobile/MobileResponsiveTest";

// Mock data for the table
const mockArbitrageData = [
  {
    id: 1,
    sport: "Futball",
    event: "Real Madrid vs Barcelona",
    bookmaker1: "Bet365",
    odds1: 2.10,
    bookmaker2: "William Hill",
    odds2: 2.15,
    profit: 2.3,
    status: "Aktív"
  },
  {
    id: 2,
    sport: "Kosárlabda",
    event: "Lakers vs Warriors",
    bookmaker1: "Unibet",
    odds1: 1.85,
    bookmaker2: "Betway",
    odds2: 1.90,
    profit: 1.8,
    status: "Aktív"
  },
  {
    id: 3,
    sport: "Tenisz",
    event: "Djokovic vs Nadal",
    bookmaker1: "888sport",
    odds1: 1.95,
    bookmaker2: "Betfair",
    odds2: 2.00,
    profit: 2.5,
    status: "Lejárt"
  },
  {
    id: 4,
    sport: "Jégkorong",
    event: "Maple Leafs vs Canadiens",
    bookmaker1: "Paddy Power",
    odds1: 2.25,
    bookmaker2: "Coral",
    odds2: 2.30,
    profit: 1.2,
    status: "Aktív"
  },
  {
    id: 5,
    sport: "Rugby",
    event: "All Blacks vs Springboks",
    bookmaker1: "Ladbrokes",
    odds1: 1.75,
    bookmaker2: "Betfred",
    odds2: 1.80,
    profit: 2.8,
    status: "Aktív"
  }
];

export default function MobileTestPage() {
  const deviceInfo = useDeviceInfo();
  const pwaStatus = usePWAStatus();
  const offlineStatus = useOfflineStatus();
  const [currentRoute, setCurrentRoute] = useState("/");
  const [activeTab, setActiveTab] = useState("overview");

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    console.log("Navigating to:", route);
  };

  const tableColumns = [
    {
      key: "sport" as const,
      header: "Sport",
      width: "20%",
    },
    {
      key: "event" as const,
      header: "Esemény",
      width: "30%",
    },
    {
      key: "odds1" as const,
      header: "Odds 1",
      width: "15%",
      render: (value: string | number) => (
        <span className="font-mono text-sm">{typeof value === 'number' ? value.toFixed(2) : value}</span>
      ),
    },
    {
      key: "odds2" as const,
      header: "Odds 2",
      width: "15%",
      render: (value: string | number) => (
        <span className="font-mono text-sm">{typeof value === 'number' ? value.toFixed(2) : value}</span>
      ),
    },
    {
      key: "profit" as const,
      header: "Profit %",
      width: "20%",
      render: (value: string | number) => (
        <Badge variant={typeof value === 'number' && value > 2 ? "default" : "secondary"} className="text-xs">
          {typeof value === 'number' ? value.toFixed(1) : value}%
        </Badge>
      ),
    },
  ];

  return (
    <MobileLayout showHeader={false} showFooter={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Mobil Teszt Oldal
            </h1>
            <p className="text-muted-foreground">
              ProTipp V2 mobil optimalizálás tesztelése
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {deviceInfo.isMobile ? "Mobil" : deviceInfo.isTablet ? "Tablet" : "Asztali"}
          </Badge>
        </div>

        {/* Navigation */}
        <MobileNavigation
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Áttekintés</TabsTrigger>
            <TabsTrigger value="components">Komponensek</TabsTrigger>
            <TabsTrigger value="performance">Teljesítmény</TabsTrigger>
            <TabsTrigger value="pwa">PWA</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Device Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Eszköz Információk</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Típus:</span>
                    <span className="font-medium">
                      {deviceInfo.isMobile ? "Mobil" : deviceInfo.isTablet ? "Tablet" : "Asztali"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Felbontás:</span>
                    <span className="font-medium">
                      {deviceInfo.screenSize.width} x {deviceInfo.screenSize.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Touch:</span>
                    <span className="font-medium">
                      {deviceInfo.isTouch ? "Igen" : "Nem"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orientáció:</span>
                    <span className="font-medium capitalize">
                      {deviceInfo.orientation}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Connection Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    {offlineStatus.isOnline ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                    <span>Kapcsolat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Státus:</span>
                    <Badge variant={offlineStatus.isOnline ? "default" : "destructive"}>
                      {offlineStatus.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Típus:</span>
                    <span className="font-medium capitalize">
                      {offlineStatus.connectionType || "Ismeretlen"}
                    </span>
                  </div>
                  {offlineStatus.lastOnline && (
                    <div className="flex justify-between">
                      <span>Utolsó online:</span>
                      <span className="font-medium text-xs">
                        {offlineStatus.lastOnline.toLocaleTimeString('hu-HU')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* PWA Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>PWA Státus</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Telepítve:</span>
                    <Badge variant={pwaStatus.isInstalled ? "default" : "secondary"}>
                      {pwaStatus.isInstalled ? "Igen" : "Nem"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Telepíthető:</span>
                    <Badge variant={pwaStatus.canInstall ? "default" : "secondary"}>
                      {pwaStatus.canInstall ? "Igen" : "Nem"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Worker:</span>
                    <Badge variant={pwaStatus.hasServiceWorker ? "default" : "secondary"}>
                      {pwaStatus.hasServiceWorker ? "Aktív" : "Inaktív"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gyors Műveletek</CardTitle>
                <CardDescription>
                  Tesztelje a mobil funkciókat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="flex flex-col items-center space-y-1 h-auto p-3">
                                    <Smartphone className="h-5 w-5" />
                <span className="text-xs">Touch Teszt</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-1 h-auto p-3">
                    <Zap className="h-5 w-5" />
                    <span className="text-xs">Teljesítmény</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-1 h-auto p-3">
                    <Settings className="h-5 w-5" />
                    <span className="text-xs">Beállítások</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-1 h-auto p-3">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Szinkronizálás</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Mobile Responsive Test */}
            <Card>
              <CardHeader>
                <CardTitle>Mobile Responsive Teszt</CardTitle>
                <CardDescription>
                  Touch target-ek, form elemek és typography tesztelése
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileResponsiveTest />
              </CardContent>
            </Card>

            {/* Touch Optimized Table */}
            <Card>
              <CardHeader>
                <CardTitle>Touch-optimalizált Táblázat</CardTitle>
                <CardDescription>
                  Swipe gesztusokkal és touch-barát interakciókkal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TouchOptimizedTable
                  data={mockArbitrageData}
                  columns={tableColumns}
                  onRowClick={(row) => console.log("Row clicked:", row)}
                  onSort={(key, direction) => console.log("Sort:", key, direction)}
                  maxHeight="400px"
                  itemsPerPage={3}
                />
              </CardContent>
            </Card>

            {/* Offline Indicator */}
            <Card>
              <CardHeader>
                <CardTitle>Offline Indikátor</CardTitle>
                <CardDescription>
                  Kapcsolat státus és offline funkcionalitás
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OfflineIndicator showDetails={true} />
              </CardContent>
            </Card>

            {/* Data Saver */}
            <Card>
              <CardHeader>
                <CardTitle>Adatmentés</CardTitle>
                <CardDescription>
                  Adatfelhasználás optimalizálása
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataSaver />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teljesítmény Metrikák</CardTitle>
                <CardDescription>
                  Mobil optimalizálás eredményei
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2.3s</div>
                    <div className="text-sm text-muted-foreground">Betöltési idő</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">45%</div>
                    <div className="text-sm text-muted-foreground">Adatmentés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-sm text-muted-foreground">Cache hatékonyság</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">A+</div>
                    <div className="text-sm text-muted-foreground">Lighthouse</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimalizálási Javaslatok</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Képek automatikus optimalizálása aktív</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Lazy loading minden képre alkalmazva</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Cache méret optimalizálása javasolt</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PWA Tab */}
          <TabsContent value="pwa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PWA Funkciók</CardTitle>
                <CardDescription>
                  Progresszív Webalkalmazás képességek
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Telepítés</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Alkalmazás telepítése</span>
                        <Button size="sm" disabled={!pwaStatus.canInstall}>
                          Telepítés
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Háttérben szinkronizálás</span>
                        <Button size="sm" variant="outline">
                          Beállítás
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Offline Funkciók</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Arbitrage adatok megtekintése</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Korábbi eredmények</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Új adatok letöltése</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PWA Tesztelés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Offline mód szimulálása
                  </Button>
                  <Button className="w-full" variant="outline">
                    Push notification teszt
                  </Button>
                  <Button className="w-full" variant="outline">
                    Cache törlése
                  </Button>
                  <Button className="w-full" variant="outline">
                    Service Worker újratöltése
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
