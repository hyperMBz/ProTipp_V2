"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, addDays, subDays } from 'date-fns';
import { hu } from 'date-fns/locale';
import { UnifiedBetHistory } from '@/lib/types/bet-history';
import { Calendar, TrendingUp, Target, Activity } from 'lucide-react';

interface WinRateHeatmapProps {
  data: UnifiedBetHistory[];
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
  className?: string;
}

interface DayData {
  date: Date;
  dateString: string;
  bets: number;
  wins: number;
  profit: number;
  winRate: number;
  intensity: number; // 0-1 for color intensity
}

export function WinRateHeatmap({
  data,
  timeframe = '90d',
  className
}: WinRateHeatmapProps) {

  const heatmapData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Determine date range based on timeframe
    switch (timeframe) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default: // 'all'
        startDate = data.length > 0
          ? new Date(Math.min(...data.map(bet => new Date(bet.placed_at || bet.placedAt || new Date()).getTime())))
          : subDays(now, 365);
    }

    // Get all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Group bets by date
    const betsByDate = new Map<string, {
      bets: number;
      wins: number;
      profit: number;
    }>();

    data.forEach(bet => {
      const betDate = new Date(bet.placed_at || bet.placedAt || new Date());
      if (betDate >= startDate && betDate <= endDate && bet.status !== 'pending') {
        const dateKey = format(betDate, 'yyyy-MM-dd');

        if (!betsByDate.has(dateKey)) {
          betsByDate.set(dateKey, { bets: 0, wins: 0, profit: 0 });
        }

        const dayStats = betsByDate.get(dateKey)!;
        dayStats.bets += 1;
        dayStats.profit += bet.profit || 0;
        if (bet.status === 'won') {
          dayStats.wins += 1;
        }
      }
    });

    // Create day data with win rates and intensities
    const maxBets = Math.max(...Array.from(betsByDate.values()).map(d => d.bets), 1);
    const maxProfit = Math.max(...Array.from(betsByDate.values()).map(d => Math.abs(d.profit)), 1);

    const dayDataMap = new Map<string, DayData>();

    allDays.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayStats = betsByDate.get(dateKey) || { bets: 0, wins: 0, profit: 0 };

      const winRate = dayStats.bets > 0 ? (dayStats.wins / dayStats.bets) * 100 : 0;

      // Calculate intensity based on activity level and performance
      let intensity = 0;
      if (dayStats.bets > 0) {
        const activityIntensity = dayStats.bets / maxBets; // 0-1 based on bet volume
        const profitIntensity = dayStats.profit > 0 ? dayStats.profit / maxProfit : 0;
        intensity = Math.min(1, (activityIntensity * 0.7) + (profitIntensity * 0.3));
      }

      dayDataMap.set(dateKey, {
        date,
        dateString: dateKey,
        bets: dayStats.bets,
        wins: dayStats.wins,
        profit: dayStats.profit,
        winRate,
        intensity
      });
    });

    return dayDataMap;
  }, [data, timeframe]);

  // Organize data into weeks for calendar layout
  const weekData = useMemo(() => {
    const days = Array.from(heatmapData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

    if (days.length === 0) return [];

    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    // Fill the first week with empty days if needed
    const firstDay = days[0];
    const firstDayOfWeek = getDay(firstDay.date); // 0 = Sunday

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: addDays(firstDay.date, i - firstDayOfWeek),
        dateString: '',
        bets: 0,
        wins: 0,
        profit: 0,
        winRate: 0,
        intensity: 0
      });
    }

    days.forEach(day => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Fill the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDay = currentWeek[currentWeek.length - 1];
        currentWeek.push({
          date: addDays(lastDay.date, 1),
          dateString: '',
          bets: 0,
          wins: 0,
          profit: 0,
          winRate: 0,
          intensity: 0
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [heatmapData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const daysWithBets = Array.from(heatmapData.values()).filter(day => day.bets > 0);

    const totalBets = daysWithBets.reduce((sum, day) => sum + day.bets, 0);
    const totalProfit = daysWithBets.reduce((sum, day) => sum + day.profit, 0);
    const activeDays = daysWithBets.length;
    const bestDay = daysWithBets.reduce((best, day) =>
      day.profit > best.profit ? day : best,
      { profit: -Infinity, winRate: 0, bets: 0, date: new Date() }
    );
    const worstDay = daysWithBets.reduce((worst, day) =>
      day.profit < worst.profit ? day : worst,
      { profit: Infinity, winRate: 0, bets: 0, date: new Date() }
    );

    const avgWinRate = daysWithBets.length > 0
      ? daysWithBets.reduce((sum, day) => sum + day.winRate, 0) / daysWithBets.length
      : 0;

    return {
      totalBets,
      totalProfit,
      activeDays,
      bestDay: bestDay.profit !== -Infinity ? bestDay : null,
      worstDay: worstDay.profit !== Infinity ? worstDay : null,
      avgWinRate
    };
  }, [heatmapData]);

  const getDayColor = (day: DayData) => {
    if (day.bets === 0) return 'bg-muted/20';

    if (day.profit > 0) {
      const alpha = Math.min(1, day.intensity * 2);
      return `bg-green-500/[${Math.max(0.1, alpha)}]`;
    } else if (day.profit < 0) {
      const alpha = Math.min(1, day.intensity * 2);
      return `bg-red-500/[${Math.max(0.1, alpha)}]`;
    } else {
      return 'bg-yellow-500/20';
    }
  };

  const getDayColorStyle = (day: DayData) => {
    if (day.bets === 0) return { backgroundColor: 'rgba(115, 115, 115, 0.1)' };

    if (day.profit > 0) {
      const alpha = Math.min(0.8, day.intensity * 2);
      return { backgroundColor: `rgba(34, 197, 94, ${Math.max(0.2, alpha)})` };
    } else if (day.profit < 0) {
      const alpha = Math.min(0.8, day.intensity * 2);
      return { backgroundColor: `rgba(239, 68, 68, ${Math.max(0.2, alpha)})` };
    } else {
      return { backgroundColor: 'rgba(245, 158, 11, 0.3)' };
    }
  };

  const weekDays = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'];

  return (
    <Card className={`gradient-bg border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Teljesítmény heatmap</span>
            </CardTitle>
            <CardDescription>
              Napi nyereség és aktivitás vizualizáció
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {summaryStats.activeDays} aktív nap
            </div>
            <div className="text-sm text-muted-foreground">
              {summaryStats.avgWinRate.toFixed(1)}% átlag nyerési ráta
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Kevesebb</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-sm bg-muted/20"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/20"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/40"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/60"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/80"></div>
            </div>
            <span className="text-sm text-muted-foreground">Több</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm bg-green-500/60"></div>
              <span className="text-xs text-muted-foreground">Nyereség</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm bg-red-500/60"></div>
              <span className="text-xs text-muted-foreground">Veszteség</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm bg-muted/20"></div>
              <span className="text-xs text-muted-foreground">Nincs aktivitás</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs text-muted-foreground text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="relative group"
                >
                  <div
                    className="w-6 h-6 rounded-sm transition-all duration-200 hover:scale-110 cursor-pointer"
                    style={getDayColorStyle(day)}
                    title={day.dateString ? `${format(day.date, 'MMM dd', { locale: hu })}: ${day.bets} fogadás, ${day.winRate.toFixed(0)}% nyerési ráta` : ''}
                  />

                  {/* Tooltip */}
                  {day.dateString && day.bets > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      <div className="text-sm font-semibold">{format(day.date, 'MMM dd', { locale: hu })}</div>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Fogadások: {day.bets}</div>
                        <div>Nyerések: {day.wins}</div>
                        <div>Nyerési ráta: {day.winRate.toFixed(1)}%</div>
                        <div className={day.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                          Profit: {day.profit >= 0 ? '+' : ''}{day.profit.toFixed(0)} Ft
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Legjobb nap</span>
            </div>
            {summaryStats.bestDay ? (
              <>
                <div className="text-lg font-semibold text-green-400">
                  +{summaryStats.bestDay.profit.toFixed(0)} Ft
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(summaryStats.bestDay.date, 'MMM dd', { locale: hu })}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">-</div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <span className="text-sm text-muted-foreground">Legrosszabb nap</span>
            </div>
            {summaryStats.worstDay ? (
              <>
                <div className="text-lg font-semibold text-red-400">
                  {summaryStats.worstDay.profit.toFixed(0)} Ft
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(summaryStats.worstDay.date, 'MMM dd', { locale: hu })}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">-</div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Átlag nyerési ráta</span>
            </div>
            <div className="text-lg font-semibold text-blue-400">
              {summaryStats.avgWinRate.toFixed(1)}%
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {summaryStats.avgWinRate >= 55 ? 'Kiváló' : summaryStats.avgWinRate >= 50 ? 'Jó' : 'Fejlesztendő'}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Aktív napok</span>
            </div>
            <div className="text-lg font-semibold text-purple-400">
              {summaryStats.activeDays}
            </div>
            <div className="text-xs text-muted-foreground">
              {summaryStats.totalBets} fogadás
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
