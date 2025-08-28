"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { hu } from 'date-fns/locale';
import { UnifiedBetHistory } from '@/lib/types/bet-history';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartTooltipPayload } from '@/lib/types/charts';

interface BankrollGrowthChartProps {
  data: UnifiedBetHistory[];
  initialBankroll?: number;
  className?: string;
}

export function BankrollGrowthChart({
  data,
  initialBankroll = 1000000,
  className
}: BankrollGrowthChartProps) {

  const chartData = useMemo(() => {
    if (data.length === 0) {
      // Generate sample data for demo
      const days = 30;
      const startDate = subDays(new Date(), days);

      let currentBankroll = initialBankroll;

      return eachDayOfInterval({
        start: startDate,
        end: new Date()
      }).map((date, index) => {
        const dailyChange = (Math.random() - 0.4) * 8000; // -3200 to 4800
        currentBankroll += dailyChange;

        const drawdown = Math.max(0, initialBankroll - currentBankroll);
        const growth = ((currentBankroll - initialBankroll) / initialBankroll) * 100;

        return {
          date: format(date, 'yyyy-MM-dd'),
          displayDate: format(date, 'MMM dd', { locale: hu }),
          bankroll: Math.max(0, currentBankroll),
          initialValue: initialBankroll,
          profit: currentBankroll - initialBankroll,
          drawdown,
          growthPercent: growth,
          dailyChange
        };
      });
    }

    // Group bets by date and calculate cumulative bankroll
    const betsByDate = data
      .filter(bet => bet.status !== 'pending') // Only include settled bets
      .sort((a, b) => {
        const dateA = new Date(a.placed_at || a.placedAt || new Date());
        const dateB = new Date(b.placed_at || b.placedAt || new Date());
        return dateA.getTime() - dateB.getTime();
      });

    if (betsByDate.length === 0) {
      return [{
        date: format(new Date(), 'yyyy-MM-dd'),
        displayDate: format(new Date(), 'MMM dd', { locale: hu }),
        bankroll: initialBankroll,
        initialValue: initialBankroll,
        profit: 0,
        drawdown: 0,
        growthPercent: 0,
        dailyChange: 0
      }];
    }

    const dateMap = new Map<string, number>();

    // Aggregate profit by date
    betsByDate.forEach(bet => {
      const betDate = new Date(bet.placed_at || bet.placedAt || new Date());
      const dateKey = format(betDate, 'yyyy-MM-dd');

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, 0);
      }

      dateMap.set(dateKey, dateMap.get(dateKey)! + (bet.profit || 0));
    });

    // Convert to array and calculate cumulative bankroll
    let cumulativeProfit = 0;
    let maxBankroll = initialBankroll;

    const sortedDates = Array.from(dateMap.entries()).sort(([a], [b]) => a.localeCompare(b));

    return sortedDates.map(([dateKey, dailyProfit]) => {
      cumulativeProfit += dailyProfit;
      const currentBankroll = initialBankroll + cumulativeProfit;

      // Track maximum for drawdown calculation
      if (currentBankroll > maxBankroll) {
        maxBankroll = currentBankroll;
      }

      const drawdown = Math.max(0, maxBankroll - currentBankroll);
      const growthPercent = ((currentBankroll - initialBankroll) / initialBankroll) * 100;

      return {
        date: dateKey,
        displayDate: format(new Date(dateKey), 'MMM dd', { locale: hu }),
        bankroll: Math.max(0, currentBankroll),
        initialValue: initialBankroll,
        profit: cumulativeProfit,
        drawdown,
        growthPercent,
        dailyChange: dailyProfit
      };
    });
  }, [data, initialBankroll]);

  const latestData = chartData[chartData.length - 1];
  const firstData = chartData[0];

  const currentBankroll = latestData?.bankroll || initialBankroll;
  const totalGrowth = latestData?.growthPercent || 0;
  const totalProfit = latestData?.profit || 0;
  const maxDrawdown = Math.max(...chartData.map(d => d.drawdown), 0);
  const maxDrawdownPercent = initialBankroll > 0 ? (maxDrawdown / initialBankroll) * 100 : 0;

  type TooltipPayloadData = {
    bankroll: number;
    profit: number;
    growthPercent: number;
    dailyChange: number;
    drawdown: number;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload<TooltipPayloadData>[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Bankroll:</span>{' '}
              <span className="font-semibold text-primary">
                {formatNumber(data.bankroll)} Ft
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Profit:</span>{' '}
              <span className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.profit >= 0 ? '+' : ''}{formatNumber(data.profit)} Ft
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Növekedés:</span>{' '}
              <span className={`font-semibold ${data.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.growthPercent >= 0 ? '+' : ''}{data.growthPercent.toFixed(1)}%
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Napi változás:</span>{' '}
              <span className={`font-semibold ${data.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.dailyChange >= 0 ? '+' : ''}{formatNumber(data.dailyChange)} Ft
              </span>
            </p>
            {data.drawdown > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">Drawdown:</span>{' '}
                <span className="font-semibold text-red-400">
                  -{formatNumber(data.drawdown)} Ft
                </span>
              </p>
            )}
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
              <DollarSign className="h-5 w-5 text-green-400" />
              <span>Bankroll növekedés</span>
            </CardTitle>
            <CardDescription>
              Tőke alakulása és profit akkumuláció
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatNumber(currentBankroll)} Ft
            </div>
            <div className="text-sm flex items-center space-x-1">
              {totalGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span className={totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}>
                {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bankrollGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={totalGrowth >= 0 ? "#10b981" : "#ef4444"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={totalGrowth >= 0 ? "#10b981" : "#ef4444"}
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
                tickFormatter={(value) => `${formatNumber(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Initial bankroll reference line */}
              <ReferenceLine
                y={initialBankroll}
                stroke="#6b7280"
                strokeDasharray="8 8"
                label={{ value: "Kezdő tőke", position: "left" }}
              />

              {/* Bankroll area chart */}
              <Area
                type="monotone"
                dataKey="bankroll"
                stroke={totalGrowth >= 0 ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#bankrollGradient)"
                dot={{
                  fill: totalGrowth >= 0 ? "#10b981" : "#ef4444",
                  strokeWidth: 2,
                  r: 2
                }}
                activeDot={{
                  r: 5,
                  fill: totalGrowth >= 0 ? "#10b981" : "#ef4444",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Összprofit</div>
            <div className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatNumber(totalProfit)} Ft
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Növekedés</div>
            <div className={`text-lg font-semibold ${totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Max Drawdown</div>
            <div className="text-lg font-semibold text-red-400">
              -{formatNumber(maxDrawdown)} Ft
            </div>
            <div className="text-xs text-muted-foreground">
              ({maxDrawdownPercent.toFixed(1)}%)
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Jelenlegi tőke</div>
            <div className="text-lg font-semibold text-primary">
              {formatNumber(currentBankroll)} Ft
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
