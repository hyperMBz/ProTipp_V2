"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";
import { UnifiedBetHistory } from '@/lib/types/bet-history';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetricsProps {
  betHistory: UnifiedBetHistory[];
  stats: {
    totalBets: number;
    totalProfit: number;
    totalStaked: number;
    winRate: number;
    avgCLV: number;
  };
  className?: string;
}

export function PerformanceMetrics({ betHistory, stats, className }: PerformanceMetricsProps) {

  const metrics = useMemo(() => {
    if (betHistory.length === 0) {
      // Demo metrics
      return {
        roi: 12.5,
        sharpeRatio: 1.35,
        maxDrawdown: 8.2,
        avgStake: 25000,
        avgOdds: 2.15,
        profitPerBet: 1200,
        bestStreak: 8,
        worstStreak: 3,
        consistency: 78,
        riskScore: 65,
        kellyPercent: 2.8,
        expectancy: 850,
        profitFactor: 1.45,
        variance: 15.2,
        daysSinceLastBet: 2,
        avgBetsPerWeek: 8.5,
        marketEfficiency: 92
      };
    }

    const settledBets = betHistory.filter(bet => ['won', 'lost'].includes(bet.status));

    const totalStaked = stats.totalStaked;
    const totalProfit = stats.totalProfit;
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    const avgStake = settledBets.length > 0 ? totalStaked / settledBets.length : 0;
    const avgOdds = settledBets.length > 0
      ? settledBets.reduce((sum, bet) => sum + bet.odds, 0) / settledBets.length
      : 0;

    const profitPerBet = settledBets.length > 0 ? totalProfit / settledBets.length : 0;

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let tempWorstStreak = 0;

    settledBets.forEach(bet => {
      if (bet.status === 'won') {
        currentStreak++;
        tempWorstStreak = 0;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
        tempWorstStreak++;
        worstStreak = Math.max(worstStreak, tempWorstStreak);
      }
    });

    // Calculate consistency (% of profitable weeks)
    const weeklyProfits = new Map<string, number>();
    betHistory.forEach(bet => {
      const weekKey = new Date(bet.placed_at || bet.placedAt || new Date()).toISOString().slice(0, 10);
      weeklyProfits.set(weekKey, (weeklyProfits.get(weekKey) || 0) + (bet.profit || 0));
    });

    const profitableWeeks = Array.from(weeklyProfits.values()).filter(profit => profit > 0).length;
    const totalWeeks = weeklyProfits.size;
    const consistency = totalWeeks > 0 ? (profitableWeeks / totalWeeks) * 100 : 0;

    // Risk metrics
    const profits = settledBets.map(bet => bet.profit || 0);
    const variance = profits.length > 1
      ? profits.reduce((sum, profit) => sum + Math.pow(profit - profitPerBet, 2), 0) / (profits.length - 1)
      : 0;

    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (profitPerBet / stdDev) * Math.sqrt(252) : 0; // Annualized

    // Kelly Criterion estimation
    const winningBets = settledBets.filter(bet => bet.status === 'won');
    const avgWinAmount = winningBets.length > 0
      ? winningBets.reduce((sum, bet) => sum + (bet.profit || 0), 0) / winningBets.length
      : 0;

    const losingBets = settledBets.filter(bet => bet.status === 'lost');
    const avgLossAmount = losingBets.length > 0
      ? Math.abs(losingBets.reduce((sum, bet) => sum + (bet.profit || 0), 0) / losingBets.length)
      : 0;

    const kellyPercent = avgLossAmount > 0 && avgOdds > 1
      ? ((stats.winRate / 100) * avgOdds - 1) / (avgOdds - 1) * 100
      : 0;

    // Expectancy
    const expectancy = (stats.winRate / 100) * avgWinAmount - ((100 - stats.winRate) / 100) * avgLossAmount;

    // Profit Factor
    const grossProfit = winningBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const grossLoss = Math.abs(losingBets.reduce((sum, bet) => sum + (bet.profit || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Max Drawdown calculation
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;

    settledBets.forEach(bet => {
      cumulative += bet.profit || 0;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const maxDrawdownPercent = totalStaked > 0 ? (maxDrawdown / totalStaked) * 100 : 0;

    // Risk Score (0-100, lower is better)
    const riskScore = Math.min(100,
      (maxDrawdownPercent * 2) +
      (stdDev / avgStake * 20) +
      ((100 - consistency) / 2)
    );

    // Days since last bet
    const lastBetDate = settledBets.length > 0
      ? new Date(settledBets[settledBets.length - 1].placed_at || settledBets[settledBets.length - 1].placedAt || new Date())
      : new Date();
    const daysSinceLastBet = Math.floor((Date.now() - lastBetDate.getTime()) / (1000 * 60 * 60 * 24));

    // Betting frequency
    const firstBetDate = settledBets.length > 0
      ? new Date(settledBets[0].placed_at || settledBets[0].placedAt || new Date())
      : new Date();
    const totalDays = Math.max(1, Math.floor((Date.now() - firstBetDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgBetsPerWeek = (settledBets.length / totalDays) * 7;

    // Market efficiency (based on CLV)
    const marketEfficiency = Math.min(100, Math.max(0, 50 + stats.avgCLV * 10));

    return {
      roi,
      sharpeRatio,
      maxDrawdown: maxDrawdownPercent,
      avgStake,
      avgOdds,
      profitPerBet,
      bestStreak,
      worstStreak,
      consistency,
      riskScore,
      kellyPercent: Math.max(0, Math.min(10, kellyPercent)), // Cap at 10%
      expectancy,
      profitFactor,
      variance: stdDev,
      daysSinceLastBet,
      avgBetsPerWeek,
      marketEfficiency
    };
  }, [betHistory, stats]);

  const getRiskLevel = (riskScore: number) => {
    if (riskScore <= 30) return { level: 'Alacsony', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (riskScore <= 60) return { level: 'Közepes', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    return { level: 'Magas', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-400' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-400' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const riskLevel = getRiskLevel(metrics.riskScore);
  const performanceGrade = getGradeFromScore(metrics.consistency);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                <div className="text-xl font-bold text-green-400">
                  {metrics.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.sharpeRatio > 1 ? 'Kiváló' : metrics.sharpeRatio > 0.5 ? 'Jó' : 'Gyenge'}
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
                <div className="text-sm text-muted-foreground">Kelly %</div>
                <div className="text-xl font-bold text-blue-400">
                  {metrics.kellyPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Ajánlott tét méret
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-400" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Profit Factor</div>
                <div className="text-xl font-bold text-purple-400">
                  {metrics.profitFactor.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.profitFactor > 1.5 ? 'Kiváló' : metrics.profitFactor > 1 ? 'Pozitív' : 'Negatív'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-5 w-5 ${riskLevel.color}`} />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Kockázati szint</div>
                <div className={`text-xl font-bold ${riskLevel.color}`}>
                  {riskLevel.level}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(100 - metrics.riskScore).toFixed(0)}/100
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Statistics */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Kereskedési statisztikák</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Átlag tét</span>
              <span className="font-semibold">{formatNumber(metrics.avgStake)} Ft</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Átlag odds</span>
              <span className="font-semibold">{metrics.avgOdds.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profit/fogadás</span>
              <span className={`font-semibold ${metrics.profitPerBet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.profitPerBet >= 0 ? '+' : ''}{formatNumber(metrics.profitPerBet)} Ft
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Várható érték</span>
              <span className={`font-semibold ${metrics.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.expectancy >= 0 ? '+' : ''}{formatNumber(metrics.expectancy)} Ft
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Heti fogadások</span>
              <span className="font-semibold text-blue-400">{metrics.avgBetsPerWeek.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Teljesítmény elemzés</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Konzisztencia</span>
                <span className={`font-semibold ${performanceGrade.color}`}>
                  {metrics.consistency.toFixed(0)}% ({performanceGrade.grade})
                </span>
              </div>
              <Progress value={metrics.consistency} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Piac hatékonyság</span>
                <span className="font-semibold text-purple-400">{metrics.marketEfficiency.toFixed(0)}%</span>
              </div>
              <Progress value={metrics.marketEfficiency} className="h-2" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Legjobb sorozat</span>
              <Badge variant="outline" className="border-green-400 text-green-400">
                {metrics.bestStreak} nyert
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Legrosszabb sorozat</span>
              <Badge variant="outline" className="border-red-400 text-red-400">
                {metrics.worstStreak} vesztett
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
              <span className="font-semibold text-red-400">{metrics.maxDrawdown.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Kockázatkezelés</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Kockázati pontszám</span>
                <span className={`font-semibold ${riskLevel.color}`}>
                  {metrics.riskScore.toFixed(0)}/100
                </span>
              </div>
              <Progress value={100 - metrics.riskScore} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Alacsonyabb jobb
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Volatilitás</span>
              <span className="font-semibold text-yellow-400">
                {metrics.variance.toFixed(0)} Ft
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Kelly Criterion</span>
              <Badge variant="outline" className="border-blue-400 text-blue-400">
                {metrics.kellyPercent.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Utolsó fogadás</span>
              <span className="text-sm">
                {metrics.daysSinceLastBet === 0 ? 'Ma' :
                 metrics.daysSinceLastBet === 1 ? 'Tegnap' :
                 `${metrics.daysSinceLastBet} napja`}
              </span>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  Ajánlás: {metrics.kellyPercent.toFixed(1)}% tét méret
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
