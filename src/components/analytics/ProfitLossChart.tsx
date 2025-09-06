"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon,
  AlertCircle,
  Loader2
} from "lucide-react";
import { ProfitLossData } from "@/lib/types/analytics";
import { formatCurrency, getProfitColor } from "@/lib/utils/analytics";

interface ProfitLossChartProps {
  data: ProfitLossData[];
  isLoading?: boolean;
  className?: string;
}

export function ProfitLossChart({ data, isLoading = false, className }: ProfitLossChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Adatok feldolgozása a chart-hoz
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Időkeret szerinti szűrés
    let filteredData = data;
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= weekAgo);
        break;
      case '30d':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= monthAgo);
        break;
      case '90d':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= quarterAgo);
        break;
      case 'all':
      default:
        filteredData = data;
        break;
    }

    return filteredData.map(item => ({
      date: new Date(item.date).toLocaleDateString('hu-HU', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: item.date,
      profit: item.profit,
      stake: item.stake,
      payout: item.payout,
      betCount: item.betCount,
      cumulativeProfit: 0 // Később számítjuk
    })).map((item, index, array) => {
      // Kumulatív profit számítása
      const cumulativeProfit = array
        .slice(0, index + 1)
        .reduce((sum, prevItem) => sum + prevItem.profit, 0);
      
      return {
        ...item,
        cumulativeProfit
      };
    });
  }, [data, timeframe]);

  // Statisztikák számítása
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        totalProfit: 0,
        totalBets: 0,
        avgDailyProfit: 0,
        bestDay: null,
        worstDay: null,
        winDays: 0,
        lossDays: 0
      };
    }

    const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);
    const totalBets = chartData.reduce((sum, item) => sum + item.betCount, 0);
    const avgDailyProfit = totalProfit / chartData.length;
    
    const bestDay = chartData.reduce((best, item) => 
      item.profit > best.profit ? item : best
    );
    const worstDay = chartData.reduce((worst, item) => 
      item.profit < worst.profit ? item : worst
    );
    
    const winDays = chartData.filter(item => item.profit > 0).length;
    const lossDays = chartData.filter(item => item.profit < 0).length;

    return {
      totalProfit,
      totalBets,
      avgDailyProfit,
      bestDay,
      worstDay,
      winDays,
      lossDays
    };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Profit:</span>{' '}
              <span className={getProfitColor(data.profit)}>
                {formatCurrency(data.profit)}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Tét:</span>{' '}
              {formatCurrency(data.stake)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Kifizetés:</span>{' '}
              {formatCurrency(data.payout)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Fogadások:</span>{' '}
              {data.betCount}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Kumulatív profit:</span>{' '}
              <span className={getProfitColor(data.cumulativeProfit)}>
                {formatCurrency(data.cumulativeProfit)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nincsenek elérhető adatok a kiválasztott időszakban.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'bar')}>
            <TabsList>
              <TabsTrigger value="line" className="flex items-center space-x-1">
                <LineChartIcon className="h-4 w-4" />
                <span>Vonal</span>
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Oszlop</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center space-x-2">
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList>
              <TabsTrigger value="7d">7 nap</TabsTrigger>
              <TabsTrigger value="30d">30 nap</TabsTrigger>
              <TabsTrigger value="90d">90 nap</TabsTrigger>
              <TabsTrigger value="all">Összes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="hsl(var(--secondary-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--secondary-foreground))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--secondary-foreground))', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="profit"
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Összes profit</p>
          <p className={`text-lg font-semibold ${getProfitColor(stats.totalProfit)}`}>
            {formatCurrency(stats.totalProfit)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Átlagos napi profit</p>
          <p className={`text-lg font-semibold ${getProfitColor(stats.avgDailyProfit)}`}>
            {formatCurrency(stats.avgDailyProfit)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Legjobb nap</p>
          <p className={`text-lg font-semibold ${getProfitColor(stats.bestDay?.profit || 0)}`}>
            {stats.bestDay ? formatCurrency(stats.bestDay.profit) : 'N/A'}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Legrosszabb nap</p>
          <p className={`text-lg font-semibold ${getProfitColor(stats.worstDay?.profit || 0)}`}>
            {stats.worstDay ? formatCurrency(stats.worstDay.profit) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span>Napi profit</span>
        </div>
        {chartType === 'line' && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary-foreground rounded-full" style={{ background: 'repeating-linear-gradient(45deg, hsl(var(--secondary-foreground)), hsl(var(--secondary-foreground)) 2px, transparent 2px, transparent 4px)' }}></div>
            <span>Kumulatív profit</span>
          </div>
        )}
      </div>
    </div>
  );
}
