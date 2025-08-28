"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { format, subDays, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from 'date-fns';
import { hu } from 'date-fns/locale';
import { UnifiedBetHistory } from '@/lib/types/bet-history';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { ChartTooltipPayload } from '@/lib/types/charts';

interface ROITrendsChartProps {
  data: UnifiedBetHistory[];
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
  className?: string;
}

export function ROITrendsChart({
  data,
  timeframe = '30d',
  className
}: ROITrendsChartProps) {

  const chartData = useMemo(() => {
    if (data.length === 0) {
      // Generate sample data for demo
      const weeks = timeframe === '7d' ? 1 : timeframe === '30d' ? 4 : timeframe === '90d' ? 12 : 52;
      const startDate = subDays(new Date(), weeks * 7);

      let cumulativeROI = 0;

      return eachWeekOfInterval({
        start: startDate,
        end: new Date()
      }).slice(0, weeks).map((date, index) => {
        const weeklyROI = (Math.random() - 0.4) * 8; // -3.2% to 4.8%
        const winRate = 45 + Math.random() * 20; // 45% to 65%
        const clv = (Math.random() - 0.5) * 8; // -4% to 4%
        const sharpeRatio = 0.8 + Math.random() * 0.6; // 0.8 to 1.4

        cumulativeROI += weeklyROI;

        return {
          period: format(date, 'MMM dd', { locale: hu }),
          date: format(date, 'yyyy-MM-dd'),
          weeklyROI,
          cumulativeROI,
          winRate,
          clv,
          sharpeRatio,
          bets: Math.floor(Math.random() * 15) + 5,
          volume: (Math.random() * 50000) + 20000
        };
      });
    }

    // Determine grouping based on timeframe
    const isWeekly = ['7d', '30d', '90d'].includes(timeframe);
    const isMonthly = ['1y', 'all'].includes(timeframe);

    const intervals = isWeekly
      ? eachWeekOfInterval({
          start: subDays(new Date(), timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90),
          end: new Date()
        })
      : eachMonthOfInterval({
          start: subDays(new Date(), timeframe === '1y' ? 365 : 730),
          end: new Date()
        });

    // Group bets by time period
    const periodMap = new Map<string, {
      profit: number;
      stake: number;
      bets: number;
      wins: number;
      clvSum: number;
      clvCount: number;
      date: Date;
    }>();

    data.forEach(bet => {
      const betDate = new Date(bet.placed_at || bet.placedAt || new Date());
      const periodStart = isWeekly ? startOfWeek(betDate) : startOfMonth(betDate);
      const periodKey = format(periodStart, 'yyyy-MM-dd');

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          profit: 0,
          stake: 0,
          bets: 0,
          wins: 0,
          clvSum: 0,
          clvCount: 0,
          date: periodStart
        });
      }

      const periodData = periodMap.get(periodKey)!;
      periodData.profit += bet.profit || 0;
      periodData.stake += bet.stake;
      periodData.bets += 1;
      if (bet.status === 'won') {
        periodData.wins += 1;
      }
      if (bet.clv !== undefined && bet.clv !== null) {
        periodData.clvSum += bet.clv;
        periodData.clvCount += 1;
      }
    });

    let cumulativeROI = 0;
    let cumulativeProfit = 0;
    let cumulativeStake = 0;

    return intervals
      .map(interval => {
        const periodKey = format(interval, 'yyyy-MM-dd');
        const periodData = periodMap.get(periodKey) || {
          profit: 0,
          stake: 0,
          bets: 0,
          wins: 0,
          clvSum: 0,
          clvCount: 0,
          date: interval
        };

        const weeklyROI = periodData.stake > 0 ? (periodData.profit / periodData.stake) * 100 : 0;
        const winRate = periodData.bets > 0 ? (periodData.wins / periodData.bets) * 100 : 0;
        const avgCLV = periodData.clvCount > 0 ? periodData.clvSum / periodData.clvCount : 0;

        cumulativeProfit += periodData.profit;
        cumulativeStake += periodData.stake;
        cumulativeROI = cumulativeStake > 0 ? (cumulativeProfit / cumulativeStake) * 100 : 0;

        // Calculate Sharpe ratio (simplified)
        const sharpeRatio = weeklyROI > 0 ? Math.min(2.0, weeklyROI / 10) : 0;

        return {
          period: format(interval, isWeekly ? 'MMM dd' : 'MMM yyyy', { locale: hu }),
          date: periodKey,
          weeklyROI,
          cumulativeROI,
          winRate,
          clv: avgCLV,
          sharpeRatio,
          bets: periodData.bets,
          volume: periodData.stake
        };
      })
      .filter(d => d.bets > 0); // Only include periods with bets
  }, [data, timeframe]);

  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];

  const currentROI = latestData?.cumulativeROI || 0;
  const roiChange = latestData && previousData
    ? latestData.cumulativeROI - previousData.cumulativeROI
    : 0;

  const avgWinRate = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.winRate, 0) / chartData.length
    : 0;

  const avgCLV = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.clv, 0) / chartData.length
    : 0;

  type TooltipPayloadData = {
    cumulativeROI: number;
    weeklyROI: number;
    winRate: number;
    clv: number;
    bets: number;
    volume: number;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload<TooltipPayloadData>[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">ROI (kumulatív):</span>{' '}
              <span className={`font-semibold ${data.cumulativeROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.cumulativeROI >= 0 ? '+' : ''}{data.cumulativeROI.toFixed(1)}%
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">ROI (időszak):</span>{' '}
              <span className={`font-semibold ${data.weeklyROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.weeklyROI >= 0 ? '+' : ''}{data.weeklyROI.toFixed(1)}%
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Nyerési ráta:</span>{' '}
              <span className="font-semibold text-blue-400">{data.winRate.toFixed(1)}%</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">CLV:</span>{' '}
              <span className={`font-semibold ${data.clv >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.clv >= 0 ? '+' : ''}{data.clv.toFixed(1)}%
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Fogadások:</span>{' '}
              <span className="font-semibold text-primary">{data.bets}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Volumen:</span>{' '}
              <span className="font-semibold text-muted-foreground">{formatNumber(data.volume)} Ft</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`gradient-bg border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>ROI és teljesítmény trendek</span>
            </CardTitle>
            <CardDescription>
              Főbb mutatók alakulása időben
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${currentROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentROI >= 0 ? '+' : ''}{currentROI.toFixed(1)}% ROI
            </div>
            <div className="text-sm flex items-center space-x-1">
              {roiChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span className={roiChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                {roiChange >= 0 ? '+' : ''}{roiChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="period"
                stroke="#9ca3af"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Cumulative ROI */}
              <Line
                type="monotone"
                dataKey="cumulativeROI"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                name="Kumulatív ROI"
              />

              {/* Win Rate */}
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                name="Nyerési ráta"
              />

              {/* CLV */}
              <Line
                type="monotone"
                dataKey="clv"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                name="CLV"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Átlag nyerési ráta</span>
            </div>
            <div className="text-lg font-semibold text-blue-400">
              {avgWinRate.toFixed(1)}%
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {avgWinRate >= 50 ? 'Pozitív' : 'Fejlesztendő'}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Activity className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-muted-foreground">Átlag CLV</span>
            </div>
            <div className={`text-lg font-semibold ${avgCLV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgCLV >= 0 ? '+' : ''}{avgCLV.toFixed(1)}%
            </div>
            <Badge
              variant="outline"
              className={`text-xs mt-1 ${avgCLV >= 2 ? 'border-green-400 text-green-400' : 'border-orange-400 text-orange-400'}`}
            >
              {avgCLV >= 2 ? 'Kiváló' : avgCLV >= 0 ? 'Jó' : 'Gyenge'}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Volatilitás</span>
            </div>
            <div className="text-lg font-semibold text-purple-400">
              {chartData.length > 0
                ? Math.abs(Math.max(...chartData.map(d => d.weeklyROI)) - Math.min(...chartData.map(d => d.weeklyROI))).toFixed(1)
                : '0.0'
              }%
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              Ingadozás
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
