"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { hu } from 'date-fns/locale';
import { UnifiedBetHistory } from '@/lib/types/bet-history';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProfitTimelineChartProps {
  data: UnifiedBetHistory[];
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
  className?: string;
}

export function ProfitTimelineChart({
  data,
  timeframe = '30d',
  className
}: ProfitTimelineChartProps) {

  const chartData = useMemo(() => {
    if (data.length === 0) {
      // Generate sample data for demo
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const startDate = subDays(new Date(), days);

      return eachDayOfInterval({
        start: startDate,
        end: new Date()
      }).map((date, index) => ({
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'MMM dd', { locale: hu }),
        profit: Math.floor(Math.random() * 20000 - 5000) + (index * 500),
        cumulativeProfit: (index + 1) * 1500 + Math.floor(Math.random() * 5000),
        bets: Math.floor(Math.random() * 5) + 1,
        winRate: 45 + Math.random() * 30
      }));
    }

    // Group bets by date and calculate cumulative profit
    const betsByDate = data
      .filter(bet => bet.status !== 'pending') // Only include settled bets
      .sort((a, b) => {
        const dateA = new Date(a.placed_at || a.placedAt || new Date());
        const dateB = new Date(b.placed_at || b.placedAt || new Date());
        return dateA.getTime() - dateB.getTime();
      });

    const dateMap = new Map<string, {
      profit: number;
      bets: number;
      wins: number;
      date: Date;
    }>();

    // Aggregate data by date
    betsByDate.forEach(bet => {
      const betDate = new Date(bet.placed_at || bet.placedAt || new Date());
      const dateKey = format(betDate, 'yyyy-MM-dd');

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          profit: 0,
          bets: 0,
          wins: 0,
          date: betDate
        });
      }

      const dayData = dateMap.get(dateKey)!;
      dayData.profit += bet.profit || 0;
      dayData.bets += 1;
      if (bet.status === 'won') {
        dayData.wins += 1;
      }
    });

    // Convert to array and calculate cumulative profit
    let cumulativeProfit = 0;

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, dayData]) => {
        cumulativeProfit += dayData.profit;

        return {
          date: dateKey,
          displayDate: format(dayData.date, 'MMM dd', { locale: hu }),
          profit: dayData.profit,
          cumulativeProfit,
          bets: dayData.bets,
          winRate: dayData.bets > 0 ? (dayData.wins / dayData.bets) * 100 : 0
        };
      });
  }, [data, timeframe]);

  const totalProfit = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeProfit : 0;
  const totalBets = chartData.reduce((sum, day) => sum + day.bets, 0);
  const avgDailyProfit = chartData.length > 0 ? totalProfit / chartData.length : 0;

  const isPositive = totalProfit >= 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: Record<string, unknown> }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Napi profit:</span>{' '}
              <span className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.profit >= 0 ? '+' : ''}{formatNumber(data.profit)} Ft
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Összesített:</span>{' '}
              <span className={`font-semibold ${data.cumulativeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.cumulativeProfit >= 0 ? '+' : ''}{formatNumber(data.cumulativeProfit)} Ft
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Fogadások:</span>{' '}
              <span className="font-semibold text-primary">{data.bets}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Nyerési ráta:</span>{' '}
              <span className="font-semibold text-blue-400">{data.winRate.toFixed(1)}%</span>
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
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
              <span>Profit idősor</span>
            </CardTitle>
            <CardDescription>
              Összesített profit alakulása időben
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{formatNumber(totalProfit)} Ft
            </div>
            <div className="text-sm text-muted-foreground">
              Napi átlag: {formatNumber(avgDailyProfit)} Ft
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="displayDate"
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
                tickFormatter={(value) => `${formatNumber(value)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeProfit"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#profitGradient)"
                dot={{
                  fill: isPositive ? "#10b981" : "#ef4444",
                  strokeWidth: 2,
                  r: 3
                }}
                activeDot={{
                  r: 5,
                  fill: isPositive ? "#10b981" : "#ef4444",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Összes fogadás</div>
            <div className="text-lg font-semibold text-primary">{totalBets}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Legjobb nap</div>
            <div className="text-lg font-semibold text-green-400">
              +{formatNumber(Math.max(...chartData.map(d => d.profit), 0))} Ft
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Legrosszabb nap</div>
            <div className="text-lg font-semibold text-red-400">
              {formatNumber(Math.min(...chartData.map(d => d.profit), 0))} Ft
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
