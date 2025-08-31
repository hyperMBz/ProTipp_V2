import { BetHistoryItem } from '@/lib/mock-data';
import type { Database } from '@/lib/supabase/client';

type BetHistory = Database['public']['Tables']['bet_history']['Row'];
type UnifiedBetHistory = BetHistoryItem | BetHistory;

export interface AnalyticsData {
  id: string;
  user_id: string;
  metric_type: 'profit' | 'roi' | 'win_rate' | 'volume';
  metric_value: number;
  time_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  timestamp: Date;
  data_source: string;
  breakdown: {
    sport: string;
    bookmaker: string;
    market_type: string;
  };
}

export interface PerformanceReport {
  id: string;
  user_id: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  start_date: Date;
  end_date: Date;
  total_bets: number;
  winning_bets: number;
  total_profit: number;
  roi_percentage: number;
  win_rate: number;
  average_odds: number;
  largest_win: number;
  largest_loss: number;
  best_sport: string;
  best_bookmaker: string;
}

export interface ProfitLossData {
  date: string;
  profit: number;
  cumulative_profit: number;
  bets_count: number;
  win_rate: number;
}

export interface ROITrendData {
  period: string;
  roi_percentage: number;
  total_profit: number;
  total_staked: number;
  bet_count: number;
}

export interface WinRateData {
  period: string;
  win_rate: number;
  total_bets: number;
  winning_bets: number;
  losing_bets: number;
}

export interface SportPerformanceData {
  sport: string;
  total_bets: number;
  winning_bets: number;
  total_profit: number;
  roi_percentage: number;
  win_rate: number;
  average_odds: number;
}

export interface BookmakerPerformanceData {
  bookmaker: string;
  total_bets: number;
  winning_bets: number;
  total_profit: number;
  roi_percentage: number;
  win_rate: number;
  average_odds: number;
}

export class AnalyticsDataProcessor {
  /**
   * Calculate profit/loss data for a given time period
   */
  static calculateProfitLossData(
    betHistory: UnifiedBetHistory[],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): ProfitLossData[] {
    const groupedData = this.groupBetsByTimeframe(betHistory, timeframe);
    
    return groupedData.map(({ period, bets }) => {
      const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      const winningBets = bets.filter(bet => bet.status === 'won');
      const winRate = bets.length > 0 ? (winningBets.length / bets.length) * 100 : 0;
      
      return {
        date: period,
        profit: totalProfit,
        cumulative_profit: 0, // Will be calculated below
        bets_count: bets.length,
        win_rate: winRate,
      };
    }).map((data, index, array) => {
      // Calculate cumulative profit
      const previousCumulative = index > 0 ? array[index - 1].cumulative_profit : 0;
      return {
        ...data,
        cumulative_profit: previousCumulative + data.profit,
      };
    });
  }

  /**
   * Calculate ROI trends for a given time period
   */
  static calculateROITrends(
    betHistory: UnifiedBetHistory[],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): ROITrendData[] {
    const groupedData = this.groupBetsByTimeframe(betHistory, timeframe);
    
    return groupedData.map(({ period, bets }) => {
      const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
      const roiPercentage = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
      
      return {
        period,
        roi_percentage: roiPercentage,
        total_profit: totalProfit,
        total_staked: totalStaked,
        bet_count: bets.length,
      };
    });
  }

  /**
   * Calculate win rate analysis for a given time period
   */
  static calculateWinRateAnalysis(
    betHistory: UnifiedBetHistory[],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): WinRateData[] {
    const groupedData = this.groupBetsByTimeframe(betHistory, timeframe);
    
    return groupedData.map(({ period, bets }) => {
      const winningBets = bets.filter(bet => bet.status === 'won');
      const losingBets = bets.filter(bet => bet.status === 'lost');
      const winRate = bets.length > 0 ? (winningBets.length / bets.length) * 100 : 0;
      
      return {
        period,
        win_rate: winRate,
        total_bets: bets.length,
        winning_bets: winningBets.length,
        losing_bets: losingBets.length,
      };
    });
  }

  /**
   * Calculate sport performance breakdown
   */
  static calculateSportPerformance(betHistory: UnifiedBetHistory[]): SportPerformanceData[] {
    const sportGroups = this.groupBetsBySport(betHistory);
    
    return Object.entries(sportGroups).map(([sport, bets]) => {
      const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
      const winningBets = bets.filter(bet => bet.status === 'won');
      const roiPercentage = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
      const winRate = bets.length > 0 ? (winningBets.length / bets.length) * 100 : 0;
      const averageOdds = bets.reduce((sum, bet) => sum + bet.odds, 0) / bets.length;
      
      return {
        sport,
        total_bets: bets.length,
        winning_bets: winningBets.length,
        total_profit: totalProfit,
        roi_percentage: roiPercentage,
        win_rate: winRate,
        average_odds: averageOdds,
      };
    }).sort((a, b) => b.total_profit - a.total_profit);
  }

  /**
   * Calculate bookmaker performance breakdown
   */
  static calculateBookmakerPerformance(betHistory: UnifiedBetHistory[]): BookmakerPerformanceData[] {
    const bookmakerGroups = this.groupBetsByBookmaker(betHistory);
    
    return Object.entries(bookmakerGroups).map(([bookmaker, bets]) => {
      const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
      const winningBets = bets.filter(bet => bet.status === 'won');
      const roiPercentage = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
      const winRate = bets.length > 0 ? (winningBets.length / bets.length) * 100 : 0;
      const averageOdds = bets.reduce((sum, bet) => sum + bet.odds, 0) / bets.length;
      
      return {
        bookmaker,
        total_bets: bets.length,
        winning_bets: winningBets.length,
        total_profit: totalProfit,
        roi_percentage: roiPercentage,
        win_rate: winRate,
        average_odds: averageOdds,
      };
    }).sort((a, b) => b.total_profit - a.total_profit);
  }

  /**
   * Generate comprehensive performance report
   */
  static generatePerformanceReport(
    betHistory: UnifiedBetHistory[],
    startDate: Date,
    endDate: Date,
    reportType: 'daily' | 'weekly' | 'monthly'
  ): PerformanceReport {
    const filteredBets = betHistory.filter(bet => {
      const betDate = new Date('placedAt' in bet ? bet.placedAt : bet.placed_at);
      return betDate >= startDate && betDate <= endDate;
    });

    const totalBets = filteredBets.length;
    const winningBets = filteredBets.filter(bet => bet.status === 'won');
    const totalProfit = filteredBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStaked = filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
    const roiPercentage = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
    const winRate = totalBets > 0 ? (winningBets.length / totalBets) * 100 : 0;
    const averageOdds = totalBets > 0 ? filteredBets.reduce((sum, bet) => sum + bet.odds, 0) / totalBets : 0;

    const largestWin = Math.max(...filteredBets.map(bet => bet.profit || 0));
    const largestLoss = Math.min(...filteredBets.map(bet => bet.profit || 0));

    const sportPerformance = this.calculateSportPerformance(filteredBets);
    const bookmakerPerformance = this.calculateBookmakerPerformance(filteredBets);

    const bestSport = sportPerformance.length > 0 ? sportPerformance[0].sport : 'N/A';
    const bestBookmaker = bookmakerPerformance.length > 0 ? bookmakerPerformance[0].bookmaker : 'N/A';

    return {
      id: `report-${Date.now()}`,
      user_id: 'current-user',
      report_type: reportType,
      start_date: startDate,
      end_date: endDate,
      total_bets: totalBets,
      winning_bets: winningBets.length,
      total_profit: totalProfit,
      roi_percentage: roiPercentage,
      win_rate: winRate,
      average_odds: averageOdds,
      largest_win: largestWin,
      largest_loss: largestLoss,
      best_sport: bestSport,
      best_bookmaker: bestBookmaker,
    };
  }

  /**
   * Group bets by timeframe for analysis
   */
  private static groupBetsByTimeframe(
    betHistory: UnifiedBetHistory[],
    timeframe: 'daily' | 'weekly' | 'monthly'
  ): Array<{ period: string; bets: UnifiedBetHistory[] }> {
    const groups: Record<string, UnifiedBetHistory[]> = {};

    betHistory.forEach(bet => {
      const date = new Date('placedAt' in bet ? bet.placedAt : bet.placed_at);
      let period: string;

      switch (timeframe) {
        case 'daily':
          period = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          period = date.toISOString().split('T')[0];
      }

      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(bet);
    });

    return Object.entries(groups)
      .map(([period, bets]) => ({ period, bets }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Group bets by sport
   */
  private static groupBetsBySport(betHistory: UnifiedBetHistory[]): Record<string, UnifiedBetHistory[]> {
    const groups: Record<string, UnifiedBetHistory[]> = {};
    
    betHistory.forEach(bet => {
      if (!groups[bet.sport]) {
        groups[bet.sport] = [];
      }
      groups[bet.sport].push(bet);
    });
    
    return groups;
  }

  /**
   * Group bets by bookmaker
   */
  private static groupBetsByBookmaker(betHistory: UnifiedBetHistory[]): Record<string, UnifiedBetHistory[]> {
    const groups: Record<string, UnifiedBetHistory[]> = {};
    
    betHistory.forEach(bet => {
      if (!groups[bet.bookmaker]) {
        groups[bet.bookmaker] = [];
      }
      groups[bet.bookmaker].push(bet);
    });
    
    return groups;
  }

  /**
   * Calculate Kelly Criterion for optimal bet sizing
   */
  static calculateKellyCriterion(winProbability: number, odds: number): number {
    const b = odds - 1; // Decimal odds minus 1
    const p = winProbability / 100; // Convert percentage to decimal
    const q = 1 - p; // Lose probability
    
    const kelly = (b * p - q) / b;
    return Math.max(0, Math.min(kelly, 0.25)); // Cap at 25% of bankroll
  }

  /**
   * Calculate Sharpe ratio for risk-adjusted returns
   */
  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const standardDeviation = Math.sqrt(variance);
    
    if (standardDeviation === 0) return 0;
    
    return (meanReturn - riskFreeRate) / standardDeviation;
  }
}
