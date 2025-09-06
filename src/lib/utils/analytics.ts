/**
 * Analytics utility függvények
 * Sprint 9-10: Analytics Dashboard
 */

import { 
  AnalyticsSummary, 
  PerformanceMetrics, 
  ProfitLossData, 
  BettingTrend, 
  SportPerformance, 
  BookmakerPerformance,
  DateRange,
  AnalyticsPeriod
} from '@/lib/types/analytics';

/**
 * Profit/loss adatok számítása
 */
export function calculateProfitLoss(
  stake: number, 
  payout: number, 
  result: 'won' | 'lost' | 'pending'
): number {
  if (result === 'won') {
    return payout - stake;
  } else if (result === 'lost') {
    return -stake;
  }
  return 0; // pending
}

/**
 * Win rate számítása
 */
export function calculateWinRate(wonBets: number, totalBets: number): number {
  if (totalBets === 0) return 0;
  return (wonBets / totalBets) * 100;
}

/**
 * ROI (Return on Investment) számítása
 */
export function calculateROI(totalProfit: number, totalStake: number): number {
  if (totalStake === 0) return 0;
  return (totalProfit / totalStake) * 100;
}

/**
 * Profit margin számítása
 */
export function calculateProfitMargin(totalProfit: number, totalPayout: number): number {
  if (totalPayout === 0) return 0;
  return (totalProfit / totalPayout) * 100;
}

/**
 * Átlagos profit per bet számítása
 */
export function calculateAvgProfitPerBet(totalProfit: number, totalBets: number): number {
  if (totalBets === 0) return 0;
  return totalProfit / totalBets;
}

/**
 * Analytics összefoglaló számítása
 */
export function calculateAnalyticsSummary(data: any[]): AnalyticsSummary {
  const totalBets = data.length;
  const wonBets = data.filter(item => item.result === 'won').length;
  const lostBets = data.filter(item => item.result === 'lost').length;
  const pendingBets = data.filter(item => item.result === 'pending').length;
  
  const totalStake = data.reduce((sum, item) => sum + (item.stake || 0), 0);
  const totalPayout = data
    .filter(item => item.result === 'won')
    .reduce((sum, item) => sum + (item.payout || 0), 0);
  
  const totalProfit = data.reduce((sum, item) => {
    return sum + calculateProfitLoss(item.stake || 0, item.payout || 0, item.result);
  }, 0);
  
  const winRate = calculateWinRate(wonBets, totalBets);
  const avgProfitPerBet = calculateAvgProfitPerBet(totalProfit, totalBets);
  
  const profits = data
    .filter(item => item.result === 'won')
    .map(item => item.payout - item.stake);
  const losses = data
    .filter(item => item.result === 'lost')
    .map(item => -item.stake);
  
  const maxProfit = profits.length > 0 ? Math.max(...profits) : 0;
  const maxLoss = losses.length > 0 ? Math.min(...losses) : 0;
  
  return {
    totalBets,
    wonBets,
    lostBets,
    pendingBets,
    totalStake,
    totalPayout,
    totalProfit,
    winRate,
    avgProfitPerBet,
    maxProfit,
    maxLoss
  };
}

/**
 * Performance metrics számítása
 */
export function calculatePerformanceMetrics(data: any[]): PerformanceMetrics {
  const summary = calculateAnalyticsSummary(data);
  
  const roi = calculateROI(summary.totalProfit, summary.totalStake);
  const profitMargin = calculateProfitMargin(summary.totalProfit, summary.totalPayout);
  
  return {
    totalBets: summary.totalBets,
    winRate: summary.winRate,
    totalProfit: summary.totalProfit,
    avgProfitPerBet: summary.avgProfitPerBet,
    maxProfit: summary.maxProfit,
    maxLoss: summary.maxLoss,
    roi,
    profitMargin
  };
}

/**
 * Profit/loss adatok csoportosítása dátum szerint
 */
export function groupProfitLossByDate(
  data: any[], 
  period: AnalyticsPeriod = 'day'
): ProfitLossData[] {
  const grouped = new Map<string, any[]>();
  
  data.forEach(item => {
    const date = new Date(item.created_at);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  
  return Array.from(grouped.entries())
    .map(([date, items]) => {
      const summary = calculateAnalyticsSummary(items);
      return {
        date,
        profit: summary.totalProfit,
        stake: summary.totalStake,
        payout: summary.totalPayout,
        betCount: summary.totalBets
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Betting trendek számítása
 */
export function calculateBettingTrends(
  data: any[], 
  period: AnalyticsPeriod = 'week'
): BettingTrend[] {
  const grouped = groupProfitLossByDate(data, period);
  
  return grouped.map((item, index) => {
    const previousItem = index > 0 ? grouped[index - 1] : null;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (previousItem) {
      if (item.profit > previousItem.profit) {
        trend = 'up';
      } else if (item.profit < previousItem.profit) {
        trend = 'down';
      }
    }
    
    return {
      period: item.date,
      totalBets: item.betCount,
      winRate: item.betCount > 0 ? (item.payout > 0 ? 100 : 0) : 0, // Simplified
      profit: item.profit,
      avgStake: item.betCount > 0 ? item.stake / item.betCount : 0,
      trend
    };
  });
}

/**
 * Sport performance számítása
 */
export function calculateSportPerformance(data: any[]): SportPerformance[] {
  const sportGroups = new Map<string, any[]>();
  
  data.forEach(item => {
    const sport = item.sport || 'Unknown';
    if (!sportGroups.has(sport)) {
      sportGroups.set(sport, []);
    }
    sportGroups.get(sport)!.push(item);
  });
  
  return Array.from(sportGroups.entries())
    .map(([sport, items]) => {
      const summary = calculateAnalyticsSummary(items);
      const odds = items.map(item => item.odds).filter(odds => odds > 0);
      
      return {
        sport,
        totalBets: summary.totalBets,
        winRate: summary.winRate,
        profit: summary.totalProfit,
        avgStake: summary.totalBets > 0 ? summary.totalStake / summary.totalBets : 0,
        bestOdds: odds.length > 0 ? Math.max(...odds) : 0,
        worstOdds: odds.length > 0 ? Math.min(...odds) : 0
      };
    })
    .sort((a, b) => b.profit - a.profit);
}

/**
 * Bookmaker performance számítása
 */
export function calculateBookmakerPerformance(data: any[]): BookmakerPerformance[] {
  const bookmakerGroups = new Map<string, any[]>();
  
  data.forEach(item => {
    const bookmaker = item.bookmaker || 'Unknown';
    if (!bookmakerGroups.has(bookmaker)) {
      bookmakerGroups.set(bookmaker, []);
    }
    bookmakerGroups.get(bookmaker)!.push(item);
  });
  
  return Array.from(bookmakerGroups.entries())
    .map(([bookmaker, items]) => {
      const summary = calculateAnalyticsSummary(items);
      const odds = items.map(item => item.odds).filter(odds => odds > 0);
      
      return {
        bookmaker,
        totalBets: summary.totalBets,
        winRate: summary.winRate,
        profit: summary.totalProfit,
        avgStake: summary.totalBets > 0 ? summary.totalStake / summary.totalBets : 0,
        avgOdds: odds.length > 0 ? odds.reduce((sum, odd) => sum + odd, 0) / odds.length : 0
      };
    })
    .sort((a, b) => b.profit - a.profit);
}

/**
 * Dátum tartomány formázása
 */
export function formatDateRange(dateRange: DateRange): string {
  const from = new Date(dateRange.from).toLocaleDateString('hu-HU');
  const to = new Date(dateRange.to).toLocaleDateString('hu-HU');
  return `${from} - ${to}`;
}

/**
 * Pénz formázása
 */
export function formatCurrency(amount: number, currency: string = 'Ft'): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Százalék formázása
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Trend ikon meghatározása
 */
export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '📈';
    case 'down':
      return '📉';
    case 'stable':
      return '➡️';
    default:
      return '➡️';
  }
}

/**
 * Trend szín meghatározása
 */
export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-green-400';
    case 'down':
      return 'text-red-400';
    case 'stable':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Profit szín meghatározása
 */
export function getProfitColor(profit: number): string {
  if (profit > 0) return 'text-green-400';
  if (profit < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Mock adatok generálása fejlesztési célokra
 */
export function generateMockAnalyticsData(days: number = 30): any[] {
  const sports = ['Futball', 'Kosárlabda', 'Tenisz', 'Jégkorong', 'Rugby'];
  const bookmakers = ['Tippmix', 'Fortuna', 'Bet365', 'Unibet', 'Betfair'];
  const results = ['won', 'lost', 'pending'];
  
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days * 3; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i / 3));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const bookmaker = bookmakers[Math.floor(Math.random() * bookmakers.length)];
    const result = results[Math.floor(Math.random() * results.length)];
    const stake = Math.floor(Math.random() * 10000) + 1000;
    const odds = Math.random() * 5 + 1.1;
    const payout = result === 'won' ? stake * odds : 0;
    
    data.push({
      id: `bet-${i}`,
      event_name: `${sport} mérkőzés ${i + 1}`,
      sport,
      bookmaker,
      odds: parseFloat(odds.toFixed(2)),
      stake,
      payout: parseFloat(payout.toFixed(2)),
      result,
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
  
  return data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Dátum tartomány preset-ek
 */
export function getDateRangePresets(): Record<string, DateRange> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    today: {
      from: today,
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
    },
    yesterday: {
      from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      to: new Date(today.getTime() - 1)
    },
    last7days: {
      from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: now
    },
    last30days: {
      from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: now
    },
    last90days: {
      from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      to: now
    },
    thisMonth: {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now
    },
    lastMonth: {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0)
    },
    thisYear: {
      from: new Date(now.getFullYear(), 0, 1),
      to: now
    }
  };
}
