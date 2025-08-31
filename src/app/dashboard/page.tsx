"use client";

import React, { useState, useCallback } from 'react';
import { DashboardLayout, DashboardWidget } from "@/components/dashboard/DashboardLayout";
import { ArbitrageWidget } from "@/components/widgets/ArbitrageWidget";
import { WidgetWrapper } from "@/components/dashboard/DashboardWidget";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Bell,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Clock,
  Users,
  Award
} from "lucide-react";
import { useArbitrageWithFallback, useRealTimeStatus, useApiUsage } from "@/lib/hooks/use-odds-data";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [maximizedWidget, setMaximizedWidget] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API hooks
  const { isRealTime, isDemo } = useRealTimeStatus();
  const apiUsage = useApiUsage();
  const arbitrageQuery = useArbitrageWithFallback(['soccer_epl', 'basketball_nba', 'tennis_atp']);

  // Refresh kezelése
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    arbitrageQuery.refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [arbitrageQuery]);

  // Widget maximize/minimize kezelése
  const handleMaximize = useCallback((widgetId: string) => {
    setMaximizedWidget(widgetId);
  }, []);

  const handleMinimize = useCallback(() => {
    setMaximizedWidget(null);
  }, []);

  // Adatok
  const opportunities = arbitrageQuery.data || [];
  const totalOpportunities = opportunities.length;
  const avgProfitMargin = totalOpportunities > 0 
    ? opportunities.reduce((sum, opp) => sum + opp.profitMargin, 0) / totalOpportunities 
    : 0;
  const maxProfitMargin = totalOpportunities > 0 
    ? Math.max(...opportunities.map(opp => opp.profitMargin)) 
    : 0;

  // Widget definíciók
  const widgets = [
    // Supabase Status Widget
    {
      id: "supabase-status-widget",
      title: "Supabase Kapcsolat",
      description: "Adatbázis kapcsolat állapota",
      component: <SupabaseStatus />,
      w: 6,
      h: 4,
      x: 0,
      y: 0,
      minW: 3,
      minH: 3
    },

    // Arbitrage Widget
    {
      id: "arbitrage-widget",
      title: "Arbitrage Lehetőségek",
      description: "Valós idejű arbitrage lehetőségek",
      component: (
        <ArbitrageWidget
          id="arbitrage-widget"
          onRefresh={handleRefresh}
          onMaximize={() => handleMaximize("arbitrage-widget")}
          onMinimize={handleMinimize}
          isMaximized={maximizedWidget === "arbitrage-widget"}
          showFilters={true}
          showSearch={true}
          autoRefresh={true}
          refreshInterval={30000}
        />
      ),
      w: 12,
      h: 8,
      x: 0,
      y: 4,
      minW: 6,
      minH: 4
    },

    // Profit Stats Widget
    {
      id: "profit-stats-widget",
      title: "Profit Statisztikák",
      description: "Átlagos és maximális profitok",
      component: (
        <WidgetWrapper>
          <div className="h-full flex flex-col justify-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="gradient-bg border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {avgProfitMargin.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Átlagos profit</div>
                </CardContent>
              </Card>

              <Card className="gradient-bg border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {maxProfitMargin.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Maximális profit</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-primary">{totalOpportunities}</div>
              <div className="text-xs text-muted-foreground">Aktív lehetőség</div>
            </div>
          </div>
        </WidgetWrapper>
      ),
      w: 6,
      h: 4,
      x: 6,
      y: 0,
      minW: 3,
      minH: 3
    },

    // Real-time Status Widget
    {
      id: "realtime-status-widget",
      title: "Real-time Állapot",
      description: "Kapcsolat és API állapot",
      component: (
        <WidgetWrapper>
          <div className="h-full flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRealTime ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm font-medium">
                  {isRealTime ? 'Kapcsolódva' : 'Kapcsolat nélkül'}
                </span>
              </div>
              <Badge variant={isRealTime ? "default" : "secondary"} className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {isRealTime ? 'Real-time' : 'Demo'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API használat:</span>
                <span className="font-medium">{apiUsage.data?.requestsUsed || 0}/{apiUsage.data?.requestsRemaining || 1000}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((apiUsage.data?.requestsUsed || 0) / (apiUsage.data?.requestsRemaining || 1000)) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-muted-foreground">
                Utolsó frissítés: {new Date().toLocaleTimeString('hu-HU')}
              </div>
            </div>
          </div>
        </WidgetWrapper>
      ),
      w: 6,
      h: 4,
      x: 0,
      y: 4,
      minW: 3,
      minH: 3
    },

    // Quick Actions Widget
    {
      id: "quick-actions-widget",
      title: "Gyors Műveletek",
      description: "Gyakran használt funkciók",
      component: (
        <WidgetWrapper>
          <div className="h-full flex flex-col justify-center space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm" className="h-10">
                <Calendar className="h-4 w-4 mr-2" />
                Naptár
              </Button>
              <Button variant="outline" size="sm" className="h-10">
                <Users className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" className="h-10">
                <Award className="h-4 w-4 mr-2" />
                Eredmények
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1"
              >
                <Activity className="h-4 w-4 mr-2" />
                {isRefreshing ? 'Frissítés...' : 'Frissítés'}
              </Button>
            </div>
          </div>
        </WidgetWrapper>
      ),
      w: 6,
      h: 4,
      x: 6,
      y: 4,
      minW: 3,
      minH: 3
    },

    // Notifications Widget
    {
      id: "notifications-widget",
      title: "Értesítések",
      description: "Legutóbbi riasztások",
      component: (
        <WidgetWrapper>
          <div className="h-full flex flex-col justify-center space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-green-400/10 border border-green-400/20 rounded-md">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <div className="flex-1">
                  <div className="text-xs font-medium">Új arbitrage lehetőség</div>
                  <div className="text-xs text-muted-foreground">Manchester United vs Liverpool</div>
                </div>
                <div className="text-xs text-muted-foreground">2p</div>
              </div>

              <div className="flex items-center space-x-2 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded-md">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <div className="flex-1">
                  <div className="text-xs font-medium">Odds változás</div>
                  <div className="text-xs text-muted-foreground">Barcelona vs Real Madrid</div>
                </div>
                <div className="text-xs text-muted-foreground">5p</div>
              </div>

              <div className="flex items-center space-x-2 p-2 bg-blue-400/10 border border-blue-400/20 rounded-md">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <div className="flex-1">
                  <div className="text-xs font-medium">API frissítés</div>
                  <div className="text-xs text-muted-foreground">Új bookmaker hozzáadva</div>
                </div>
                <div className="text-xs text-muted-foreground">10p</div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                Összes megjelenítése
              </Button>
            </div>
          </div>
        </WidgetWrapper>
      ),
      w: 6,
      h: 4,
      x: 0,
      y: 8,
      minW: 3,
      minH: 3
    }
  ];

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

  // Layout változás kezelése
  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    console.log('Layout changed:', newLayout);
    // Itt lehetne menteni a layout-ot localStorage-ba vagy adatbázisba
  }, []);

  // Widget resize kezelése
  const handleWidgetResize = useCallback((widgetId: string, size: { w: number; h: number }) => {
    console.log('Widget resized:', widgetId, size);
  }, []);

  // Widget move kezelése
  const handleWidgetMove = useCallback((widgetId: string, position: { x: number; y: number }) => {
    console.log('Widget moved:', widgetId, position);
  }, []);

  return (
    <DashboardLayout
      widgets={widgets}
      onLayoutChange={handleLayoutChange}
      onWidgetResize={handleWidgetResize}
      onWidgetMove={handleWidgetMove}
      showControls={true}
      autoRefresh={true}
      refreshInterval={30000}
      className="min-h-screen"
    />
  );
}
