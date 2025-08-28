"use client";

import { useState } from 'react';
import { useBetHistoryStats, useBetHistoryWithFallback } from '@/lib/hooks/use-bet-history';
import { useUser } from '@/lib/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { ProfitTimelineChart } from "./ProfitTimelineChart";
import { SportPerformanceChart } from "./SportPerformanceChart";
import { ROITrendsChart } from "./ROITrendsChart";
import { BankrollGrowthChart } from "./BankrollGrowthChart";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { WinRateHeatmap } from "./WinRateHeatmap";
import { getBetPlacedDate } from '@/lib/types/bet-history';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const user = useUser();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  // Get bet history and stats
  const betHistoryQuery = useBetHistoryWithFallback();
  const statsQuery = useBetHistoryStats();

  const betHistory = betHistoryQuery.data || [];
  const stats = statsQuery.data;

  // Calculate timeframe for filtering
  const getTimeframeDate = () => {
    const now = new Date();
    switch (timeframe) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  };

  // Filter data by timeframe and sport
  const filteredBetHistory = betHistory.filter(bet => {
    const betDate = getBetPlacedDate(bet);
    const timeframeMatch = betDate >= getTimeframeDate();
    const sportMatch = selectedSport === 'all' || bet.sport === selectedSport;
    return timeframeMatch && sportMatch;
  });

  // Calculate filtered stats
  const filteredStats = {
    totalBets: filteredBetHistory.length,
    totalProfit: filteredBetHistory.reduce((sum, bet) => sum + (bet.profit || 0), 0),
    totalStaked: filteredBetHistory.reduce((sum, bet) => sum + bet.stake, 0),
    winRate: filteredBetHistory.length > 0
      ? (filteredBetHistory.filter(bet => bet.status === 'won').length /
         filteredBetHistory.filter(bet => ['won', 'lost'].includes(bet.status)).length) * 100
      : 0,
    avgCLV: filteredBetHistory
      .filter(bet => bet.clv !== undefined && bet.clv !== null)
      .reduce((sum, bet, _, arr) => sum + (bet.clv || 0) / arr.length, 0)
  };

  const roiPercentage = filteredStats.totalStaked > 0
    ? (filteredStats.totalProfit / filteredStats.totalStaked) * 100
    : 0;

  // Get unique sports for filter
  const availableSports = ['all', ...new Set(betHistory.map(bet => bet.sport))];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Részletes teljesítmény analitika és trendek
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Minden sport</SelectItem>
              {availableSports.slice(1).map(sport => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={(value: '7d' | '30d' | '90d' | '1y' | 'all') => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 nap</SelectItem>
              <SelectItem value="30d">30 nap</SelectItem>
              <SelectItem value="90d">90 nap</SelectItem>
              <SelectItem value="1y">1 év</SelectItem>
              <SelectItem value="all">Minden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Összprofit</div>
                <div className={`text-xl font-bold ${
                  filteredStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {filteredStats.totalProfit >= 0 ? '+' : ''}{formatNumber(filteredStats.totalProfit)} Ft
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {roiPercentage >= 0 ?
                <TrendingUp className="h-5 w-5 text-green-400" /> :
                <TrendingDown className="h-5 w-5 text-red-400" />
              }
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">ROI</div>
                <div className={`text-xl font-bold ${
                  roiPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {roiPercentage >= 0 ? '+' : ''}{roiPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Nyerési ráta</div>
                <div className="text-xl font-bold text-blue-400">
                  {filteredStats.winRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-400" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Átlag CLV</div>
                <div className={`text-xl font-bold ${
                  filteredStats.avgCLV >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {filteredStats.avgCLV >= 0 ? '+' : ''}{filteredStats.avgCLV.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Áttekintés</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Idősor</span>
          </TabsTrigger>
          <TabsTrigger value="sports" className="flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span>Sportok</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Trendek</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Heatmap</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfitTimelineChart
              data={filteredBetHistory}
              timeframe={timeframe}
            />
            <BankrollGrowthChart
              data={filteredBetHistory}
              initialBankroll={1000000}
            />
          </div>

          <PerformanceMetrics
            betHistory={filteredBetHistory}
            stats={filteredStats}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <ProfitTimelineChart
            data={filteredBetHistory}
            timeframe={timeframe}
            className="h-96"
          />

          <ROITrendsChart
            data={filteredBetHistory}
            timeframe={timeframe}
          />
        </TabsContent>

        {/* Sports Performance Tab */}
        <TabsContent value="sports" className="space-y-6">
          <SportPerformanceChart
            data={filteredBetHistory}
          />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <ROITrendsChart
            data={filteredBetHistory}
            timeframe={timeframe}
            className="h-96"
          />
        </TabsContent>

        {/* Heatmap Tab */}
        <TabsContent value="heatmap" className="space-y-6">
          <WinRateHeatmap
            data={filteredBetHistory}
            timeframe={timeframe}
          />
        </TabsContent>
      </Tabs>

      {/* Data Source Indicator */}
      {!user && (
        <Card className="border-yellow-500/50 bg-yellow-50/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">
                Demo mód: A chartok minta adatokat használnak. Jelentkezz be valódi adatokért!
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
