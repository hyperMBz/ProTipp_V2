"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  PieChart,
  LineChart,
  Activity,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Eye,
  EyeOff
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Import existing analytics components
import { ProfitTimelineChart } from "./ProfitTimelineChart";
import { SportPerformanceChart } from "./SportPerformanceChart";
import { ROITrendsChart } from "./ROITrendsChart";
import { BankrollGrowthChart } from "./BankrollGrowthChart";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { WinRateHeatmap } from "./WinRateHeatmap";

// Import new analytics hooks
import {
  useComprehensiveAnalytics,
  useAnalyticsConfig,
  useAnalyticsFilters,
  useAnalyticsExport,
  usePerformanceReport
} from "@/lib/hooks/use-analytics";

// Import bet history hook
import { useBetHistoryWithFallback } from "@/lib/hooks/use-bet-history";

// Import chart renderer
import { ChartRenderer } from "@/lib/analytics/chart-renderer";

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

export function AdvancedAnalyticsDashboard({ className }: AdvancedAnalyticsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCharts, setShowCharts] = useState(true);
  const [showTables, setShowTables] = useState(true);

  // Analytics hooks
  const analytics = useComprehensiveAnalytics(timeframe);
  const { config, updateConfig } = useAnalyticsConfig();
  const { filters, updateFilters, resetFilters } = useAnalyticsFilters();
  const exportMutation = useAnalyticsExport();
  
  // Bet history data
  const betHistoryQuery = useBetHistoryWithFallback();

  // Performance report for current month
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const performanceReport = usePerformanceReport(startOfMonth, endOfMonth, 'monthly');

  // Auto-refresh functionality
  useEffect(() => {
    if (!config.autoRefresh) return;

    const interval = setInterval(() => {
      analytics.refetch();
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval, analytics]);

  // Export functionality
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    const options = {
      format,
      filename: `analytics-report-${new Date().toISOString().split('T')[0]}`,
      dateRange: {
        start: filters.dateRange.start,
        end: filters.dateRange.end,
      },
      filters: {
        sport: filters.sport !== 'all' ? filters.sport : undefined,
        bookmaker: filters.bookmaker !== 'all' ? filters.bookmaker : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      },
    };

    exportMutation.mutate(options);
  };

  // Loading state
  if (analytics.isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Betöltés...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (analytics.error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>Hiba történt az adatok betöltése közben</p>
              <Button 
                variant="outline" 
                onClick={() => analytics.refetch()}
                className="mt-4"
              >
                Újrapróbálkozás
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Advanced Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Részletes elemzés és jelentések a fogadási teljesítményről
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setTimeframe(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Napi</SelectItem>
              <SelectItem value="weekly">Heti</SelectItem>
              <SelectItem value="monthly">Havi</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => analytics.refetch()}
            disabled={analytics.isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", analytics.isLoading && "animate-spin")} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceReport.data ? (
                <span className={cn(
                  performanceReport.data.total_profit >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {performanceReport.data.total_profit >= 0 ? '+' : ''}
                  {formatNumber(performanceReport.data.total_profit)} Ft
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ez a hónap
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceReport.data ? (
                <span className={cn(
                  performanceReport.data.roi_percentage >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {performanceReport.data.roi_percentage >= 0 ? '+' : ''}
                  {performanceReport.data.roi_percentage.toFixed(2)}%
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Havi hozam
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceReport.data ? (
                <span className="text-primary">
                  {performanceReport.data.win_rate.toFixed(1)}%
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Nyertes fogadások
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fogadások</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceReport.data ? (
                <span className="text-primary">
                  {performanceReport.data.total_bets}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ez a hónap
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit/Loss</TabsTrigger>
          <TabsTrigger value="roi-trends">ROI Trendek</TabsTrigger>
          <TabsTrigger value="win-rate">Win Rate</TabsTrigger>
          <TabsTrigger value="performance">Teljesítmény</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showCharts && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Profit Timeline
                    </CardTitle>
                    <CardDescription>
                      Profit trend az idő függvényében
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfitTimelineChart data={betHistoryQuery.data || []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Sport Performance
                    </CardTitle>
                    <CardDescription>
                      Teljesítmény sportonként
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SportPerformanceChart data={betHistoryQuery.data || []} />
                  </CardContent>
                </Card>
              </>
            )}

            {showTables && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      ROI Trends
                    </CardTitle>
                    <CardDescription>
                      ROI trendek időszakonként
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ROITrendsChart data={betHistoryQuery.data || []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Win Rate Heatmap
                    </CardTitle>
                    <CardDescription>
                      Win rate elemzés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WinRateHeatmap data={betHistoryQuery.data || []} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Profit/Loss Tab */}
        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Profit/Loss Analysis
              </CardTitle>
              <CardDescription>
                Részletes profit/loss elemzés és trendek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitTimelineChart data={betHistoryQuery.data || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Trends Tab */}
        <TabsContent value="roi-trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ROI Trends Analysis
              </CardTitle>
              <CardDescription>
                ROI trendek és teljesítmény elemzés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ROITrendsChart data={betHistoryQuery.data || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Win Rate Tab */}
        <TabsContent value="win-rate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Win Rate Analysis
              </CardTitle>
              <CardDescription>
                Win rate elemzés és statisztikák
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WinRateHeatmap data={betHistoryQuery.data || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sport Performance
                </CardTitle>
                <CardDescription>
                  Teljesítmény sportonként
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SportPerformanceChart data={betHistoryQuery.data || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Részletes teljesítmény metrikák
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics 
                  betHistory={betHistoryQuery.data || []} 
                  stats={performanceReport.data ? {
                    totalBets: performanceReport.data.total_bets,
                    totalProfit: performanceReport.data.total_profit,
                    totalStaked: performanceReport.data.total_bets * 25000, // Estimate based on average stake
                    winRate: performanceReport.data.win_rate,
                    avgCLV: 0 // Not available in PerformanceReport
                  } : { totalBets: 0, totalProfit: 0, totalStaked: 0, winRate: 0, avgCLV: 0 }} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Analytics
              </CardTitle>
              <CardDescription>
                Exportálja az analytics adatokat különböző formátumokban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleExport('csv')}
                    disabled={exportMutation.isPending}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV Export
                  </Button>
                  <Button
                    onClick={() => handleExport('excel')}
                    disabled={exportMutation.isPending}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel Export
                  </Button>
                  <Button
                    onClick={() => handleExport('pdf')}
                    disabled={exportMutation.isPending}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF Export
                  </Button>
                </div>
                
                {exportMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Exportálás folyamatban...
                  </div>
                )}
                
                {exportMutation.isSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Download className="h-4 w-4" />
                    Export sikeres!
                  </div>
                )}
                
                {exportMutation.isError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Download className="h-4 w-4" />
                    Export hiba: {exportMutation.error?.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
