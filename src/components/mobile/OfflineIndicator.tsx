"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Database
} from "lucide-react";
import { useOfflineStatus } from "@/lib/hooks/use-mobile";

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onSync?: () => void;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
  error: string | null;
}

export function OfflineIndicator({
  className,
  showDetails = false,
  onRetry,
  onSync,
}: OfflineIndicatorProps) {
  const { isOnline, isOffline, lastOnline, connectionType } = useOfflineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    error: null,
  });
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // Offline banner megjelenítése
  useEffect(() => {
    if (isOffline) {
      setShowOfflineBanner(true);
    } else {
      // Online állapotban 3 másodperc után elrejtjük
      const timer = setTimeout(() => {
        setShowOfflineBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  // Offline adatok szinkronizálása
  const handleSync = async () => {
    if (syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Offline adatok szinkronizálása
      await syncOfflineData();
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingItems: 0,
        error: null,
      }));

      onSync?.();
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Szinkronizálási hiba',
      }));
    }
  };

  // Offline adatok szinkronizálása
  const syncOfflineData = async () => {
    // Itt implementálhatod az offline adatok szinkronizálását
    // Például: IndexedDB-ből adatok küldése a szervernek
    
    // Szimulált szinkronizálás
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Hiba szimulálása (20% eséllyel)
    if (Math.random() < 0.2) {
      throw new Error('Hálózati hiba történt');
    }
  };

  // Újrapróbálkozás
  const handleRetry = () => {
    onRetry?.();
    // Oldal újratöltése
    window.location.reload();
  };

  // Kapcsolat típus szövege
  const getConnectionTypeText = () => {
    switch (connectionType) {
      case 'wifi':
        return 'WiFi';
      case 'cellular':
        return 'Mobil adat';
      case 'none':
        return 'Nincs kapcsolat';
      default:
        return 'Ismeretlen';
    }
  };

  // Offline idő számítása
  const getOfflineDuration = () => {
    if (!lastOnline) return 'Ismeretlen';
    
    const now = new Date();
    const diff = now.getTime() - lastOnline.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} nap`;
    if (hours > 0) return `${hours} óra`;
    if (minutes > 0) return `${minutes} perc`;
    return 'Kevesebb mint 1 perc';
  };

  return (
    <>
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span>Offline mód - Nincs internetkapcsolat</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600"
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Offline Indikátor */}
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          {/* Státus */}
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Wifi className="h-5 w-5" />
                <span className="font-medium">Online</span>
                <Badge variant="secondary" className="text-xs">
                  {getConnectionTypeText()}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <WifiOff className="h-5 w-5" />
                <span className="font-medium">Offline</span>
                <Badge variant="destructive" className="text-xs">
                  {getOfflineDuration()}
                </Badge>
              </div>
            )}
          </div>

          {/* Műveletek */}
          <div className="flex items-center space-x-2">
            {isOffline && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncStatus.isSyncing}
              >
                {syncStatus.isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Szinkronizálás</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Részletek */}
        {showDetails && (
          <div className="mt-4 space-y-3">
            {/* Kapcsolat információk */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Kapcsolat típus:</span>
                <div className="font-medium">{getConnectionTypeText()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Utolsó online:</span>
                <div className="font-medium">
                  {lastOnline ? lastOnline.toLocaleString('hu-HU') : 'Ismeretlen'}
                </div>
              </div>
            </div>

            {/* Szinkronizálási státus */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Szinkronizálási státus</span>
                {syncStatus.lastSync && (
                  <span className="text-xs text-muted-foreground">
                    Utolsó: {syncStatus.lastSync.toLocaleTimeString('hu-HU')}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* Pending items */}
                {syncStatus.pendingItems > 0 && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {syncStatus.pendingItems} elem vár szinkronizálásra
                    </span>
                  </div>
                )}

                {/* Error */}
                {syncStatus.error && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{syncStatus.error}</span>
                  </div>
                )}

                {/* Success */}
                {syncStatus.lastSync && !syncStatus.error && syncStatus.pendingItems === 0 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Minden adat szinkronizálva</span>
                  </div>
                )}

                {/* Offline data */}
                <div className="flex items-center space-x-2 text-blue-600">
                  <Database className="h-4 w-4" />
                  <span className="text-sm">Offline adatok elérhetők</span>
                </div>
              </div>
            </div>

            {/* Offline funkciók */}
            {isOffline && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Offline funkciók</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Arbitrage adatok megtekintése</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Korábbi eredmények</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Beállítások módosítása</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span>Új adatok letöltése</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
