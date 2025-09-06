"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";
import { ProfitLossChart } from "./ProfitLossChart";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { BettingTrends } from "./BettingTrends";
import { ExportPanel } from "./ExportPanel";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { formatCurrency, formatPercentage, getProfitColor } from "@/lib/utils/analytics";

interface AnalyticsDashboardProps {
  userId: string;
  className?: string;
}

export function AnalyticsDashboard({ userId, className }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    state,
    actions,
    isLoading,
    error,
    isExporting,
    exportError
  } = useAnalytics({
    userId,
    enableRealtime: true
  });

  const handleRefresh = async () => {
    await actions.refreshData();
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    await actions.exportData(format);
  };

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hiba történt az analytics adatok betöltése során: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Részletes elemzés a fogadási teljesítményedről
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Szűrők</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Frissítés</span>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Szűrők</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsFilters
              filters={state.filters}
              dateRange={state.dateRange}
              onFiltersChange={actions.setFilters}
              onDateRangeChange={actions.setDateRange}
            />
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Fogadás</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                state.summary?.totalBets || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {state.summary?.wonBets || 0} nyert, {state.summary?.lostBets || 0} vesztett
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikerességi Arány</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatPercentage(state.summary?.winRate || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {state.summary?.wonBets || 0} / {state.summary?.totalBets || 0} fogadás
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(state.summary?.totalProfit || 0)}`}>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(state.summary?.totalProfit || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Átlag: {formatCurrency(state.summary?.avgProfitPerBet || 0)} / fogadás
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Tét</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(state.summary?.totalStake || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Kifizetés: {formatCurrency(state.summary?.totalPayout || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="performance">Teljesítmény</TabsTrigger>
          <TabsTrigger value="trends">Trendek</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Profit/Loss Grafikon</CardTitle>
                <CardDescription>
                  Napi profit/veszteség trendje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitLossChart
                  data={state.profitLossData}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teljesítmény Mutatók</CardTitle>
                <CardDescription>
                  Részletes teljesítmény elemzés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics
                  metrics={state.performanceMetrics}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sport Teljesítmény</CardTitle>
                <CardDescription>
                  Teljesítmény sportonként
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.sportPerformance.map((sport: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{sport.sport}</p>
                        <p className="text-sm text-muted-foreground">
                          {sport.totalBets} fogadás
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getProfitColor(sport.profit)}`}>
                          {formatCurrency(sport.profit)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(sport.winRate)} sikerességi arány
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookmaker Teljesítmény</CardTitle>
                <CardDescription>
                  Teljesítmény bookmakerenként
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.bookmakerPerformance.map((bookmaker: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{bookmaker.bookmaker}</p>
                        <p className="text-sm text-muted-foreground">
                          {bookmaker.totalBets} fogadás
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getProfitColor(bookmaker.profit)}`}>
                          {formatCurrency(bookmaker.profit)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(bookmaker.winRate)} sikerességi arány
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fogadási Trendek</CardTitle>
              <CardDescription>
                Időbeli trendek és minták
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BettingTrends
                trends={state.bettingTrends}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adatok Exportálása</CardTitle>
              <CardDescription>
                Analytics adatok exportálása PDF vagy CSV formátumban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportPanel
                onExport={async (options: any) => {
                  const format = options.format;
                  await handleExport(format);
                }}
                isExporting={isExporting}
                exportError={exportError}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}