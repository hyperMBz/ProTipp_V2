/**
 * Analytics API integráció
 * Sprint 9-10: Analytics Dashboard
 */

import { createSupabaseClient } from '@/lib/supabase/client';
import { 
  AnalyticsSummary, 
  PerformanceMetrics, 
  ProfitLossData, 
  BettingTrend, 
  SportPerformance, 
  BookmakerPerformance,
  DateRange,
  AnalyticsFilters,
  AnalyticsPeriod
} from '@/lib/types/analytics';
import { 
  calculateAnalyticsSummary,
  calculatePerformanceMetrics,
  groupProfitLossByDate,
  calculateBettingTrends,
  calculateSportPerformance,
  calculateBookmakerPerformance,
  generateMockAnalyticsData
} from '@/lib/utils/analytics';

/**
 * Analytics összefoglaló lekérése
 */
export async function fetchAnalyticsSummary(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<AnalyticsSummary> {
  try {
    // Mock adatok használata fejlesztési célokra
    // TODO: Valódi Supabase lekérdezés implementálása
    const mockData = generateMockAnalyticsData(30);
    
    // Szűrés alkalmazása
    let filteredData = mockData;
    
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    
    if (filters?.sport) {
      filteredData = filteredData.filter(item => item.sport === filters.sport);
    }
    
    if (filters?.bookmaker) {
      filteredData = filteredData.filter(item => item.bookmaker === filters.bookmaker);
    }
    
    if (filters?.result && filters.result !== 'all') {
      filteredData = filteredData.filter(item => item.result === filters.result);
    }
    
    return calculateAnalyticsSummary(filteredData);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    throw new Error('Nem sikerült betölteni az analytics összefoglalót');
  }
}

/**
 * Performance metrics lekérése
 */
export async function fetchPerformanceMetrics(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<PerformanceMetrics> {
  try {
    // Mock adatok használata fejlesztési célokra
    const mockData = generateMockAnalyticsData(30);
    
    // Szűrés alkalmazása
    let filteredData = mockData;
    
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    
    if (filters?.sport) {
      filteredData = filteredData.filter(item => item.sport === filters.sport);
    }
    
    if (filters?.bookmaker) {
      filteredData = filteredData.filter(item => item.bookmaker === filters.bookmaker);
    }
    
    if (filters?.result && filters.result !== 'all') {
      filteredData = filteredData.filter(item => item.result === filters.result);
    }
    
    return calculatePerformanceMetrics(filteredData);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw new Error('Nem sikerült betölteni a performance metrics-et');
  }
}

/**
 * Profit/loss adatok lekérése
 */
export async function fetchProfitLossData(
  userId: string,
  period: AnalyticsPeriod = 'day',
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<ProfitLossData[]> {
  try {
    // Mock adatok használata fejlesztési célokra
    const mockData = generateMockAnalyticsData(30);
    
    // Szűrés alkalmazása
    let filteredData = mockData;
    
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    
    if (filters?.sport) {
      filteredData = filteredData.filter(item => item.sport === filters.sport);
    }
    
    if (filters?.bookmaker) {
      filteredData = filteredData.filter(item => item.bookmaker === filters.bookmaker);
    }
    
    if (filters?.result && filters.result !== 'all') {
      filteredData = filteredData.filter(item => item.result === filters.result);
    }
    
    return groupProfitLossByDate(filteredData, period);
  } catch (error) {
    console.error('Error fetching profit/loss data:', error);
    throw new Error('Nem sikerült betölteni a profit/loss adatokat');
  }
}

/**
 * Betting trendek lekérése
 */
export async function fetchBettingTrends(
  userId: string,
  period: AnalyticsPeriod = 'week',
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<BettingTrend[]> {
  try {
    // Mock adatok használata fejlesztési célokra
    const mockData = generateMockAnalyticsData(30);
    
    // Szűrés alkalmazása
    let filteredData = mockData;
    
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    
    if (filters?.sport) {
      filteredData = filteredData.filter(item => item.sport === filters.sport);
    }
    
    if (filters?.bookmaker) {
      filteredData = filteredData.filter(item => item.bookmaker === filters.bookmaker);
    }
    
    if (filters?.result && filters.result !== 'all') {
      filteredData = filteredData.filter(item => item.result === filters.result);
    }
    
    return calculateBettingTrends(filteredData, period);
  } catch (error) {
    console.error('Error fetching betting trends:', error);
    throw new Error('Nem sikerült betölteni a betting trendeket');
  }
}

/**
 * Sport performance lekérése
 */
export async function fetchSportPerformance(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<SportPerformance[]> {
  try {
    // Mock adatok használata fejlesztési célokra
    const mockData = generateMockAnalyticsData(30);
    
    // Szűrés alkalmazása
    let filteredData = mockData;
    
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    
    if (filters?.sport) {
      filteredData = filteredData.filter(item => item.sport === filters.sport);
    }
    
    if (filters?.bookmaker) {
      filteredData = filteredData.filter(item => item.bookmaker === filters.bookmaker);
    }
    
    if (filters?.result && filters.result !== 'all') {
      filteredData = filteredData.filter(item => item.result === filters.result);
    }
    
    return calculateSportPerformance(filteredData);
  } catch (error) {
    console.error('Error fetching sport performance:', error);
    throw new Error('Nem sikerült betölteni a sport performance adatokat');
  }
}

/**
 * Bookmaker performance lekérése
 */
export async function fetchBookmakerPerformance(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<BookmakerPerformance[]> {
  try {
    // Mock adatok használata fejlesztési célokra
    const mockData = generateMockAnalyticsData(30);
    
    // Szűrés alkalmazása
    let filteredData = mockData;
    
    if (dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    
    if (filters?.sport) {
      filteredData = filteredData.filter(item => item.sport === filters.sport);
    }
    
    if (filters?.bookmaker) {
      filteredData = filteredData.filter(item => item.bookmaker === filters.bookmaker);
    }
    
    if (filters?.result && filters.result !== 'all') {
      filteredData = filteredData.filter(item => item.result === filters.result);
    }
    
    return calculateBookmakerPerformance(filteredData);
  } catch (error) {
    console.error('Error fetching bookmaker performance:', error);
    throw new Error('Nem sikerült betölteni a bookmaker performance adatokat');
  }
}

/**
 * Valódi Supabase lekérdezés - Analytics adatok betöltése
 */
export async function fetchAnalyticsDataFromSupabase(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<any[]> {
  try {
    const supabase = createSupabaseClient();
    let query = supabase
      .from('bet_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Dátum szűrés
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
    }
    
    // Sport szűrés
    if (filters?.sport) {
      query = query.eq('sport', filters.sport);
    }
    
    // Bookmaker szűrés
    if (filters?.bookmaker) {
      query = query.eq('bookmaker', filters.bookmaker);
    }
    
    // Eredmény szűrés
    if (filters?.result && filters.result !== 'all') {
      query = query.eq('status', filters.result);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(`Adatbázis hiba: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    throw new Error('Nem sikerült betölteni az adatokat az adatbázisból');
  }
}

/**
 * Analytics összefoglaló lekérése valódi adatokból
 */
export async function fetchRealAnalyticsSummary(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<AnalyticsSummary> {
  try {
    const data = await fetchAnalyticsDataFromSupabase(userId, dateRange, filters);
    return calculateAnalyticsSummary(data);
  } catch (error) {
    console.error('Error fetching real analytics summary:', error);
    throw new Error('Nem sikerült betölteni az analytics összefoglalót');
  }
}

/**
 * Performance metrics lekérése valódi adatokból
 */
export async function fetchRealPerformanceMetrics(
  userId: string,
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<PerformanceMetrics> {
  try {
    const data = await fetchAnalyticsDataFromSupabase(userId, dateRange, filters);
    return calculatePerformanceMetrics(data);
  } catch (error) {
    console.error('Error fetching real performance metrics:', error);
    throw new Error('Nem sikerült betölteni a performance metrics-et');
  }
}

/**
 * Analytics adatok exportálása
 */
export async function exportAnalyticsData(
  userId: string,
  format: 'pdf' | 'csv',
  dateRange?: DateRange,
  filters?: AnalyticsFilters
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    // Mock export implementáció
    // TODO: Valódi export funkcionalitás implementálása
    
    const mockData = generateMockAnalyticsData(30);
    
    if (format === 'csv') {
      // CSV export logika
      const csvContent = generateCSVContent(mockData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: url
      };
    } else if (format === 'pdf') {
      // PDF export logika
      // TODO: PDF generálás implementálása
      return {
        success: true,
        downloadUrl: 'mock-pdf-url'
      };
    }
    
    return {
      success: false,
      error: 'Nem támogatott export formátum'
    };
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return {
      success: false,
      error: 'Nem sikerült exportálni az adatokat'
    };
  }
}

/**
 * CSV tartalom generálása
 */
function generateCSVContent(data: any[]): string {
  const headers = ['Dátum', 'Esemény', 'Sport', 'Bookmaker', 'Odds', 'Tét', 'Kifizetés', 'Eredmény', 'Profit'];
  const rows = data.map(item => [
    new Date(item.created_at).toLocaleDateString('hu-HU'),
    item.event_name,
    item.sport,
    item.bookmaker,
    item.odds,
    item.stake,
    item.payout,
    item.result,
    item.result === 'won' ? item.payout - item.stake : -item.stake
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

/**
 * Real-time analytics subscription
 */
export function subscribeToAnalyticsUpdates(
  userId: string,
  callback: (payload: any) => void
): () => void {
  const supabase = createSupabaseClient();
  const subscription = supabase
    .channel('analytics-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bet_tracker',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Analytics cache kezelése
 */
export class AnalyticsCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Globális cache instance
export const analyticsCache = new AnalyticsCache();
