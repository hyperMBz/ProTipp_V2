/**
 * Analytics Hook - Sprint 9-10: Analytics Dashboard
 * Valódi Supabase integrációval
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  AnalyticsSummary, 
  PerformanceMetrics, 
  ProfitLossData, 
  BettingTrend, 
  SportPerformance, 
  BookmakerPerformance,
  DateRange,
  AnalyticsFilters
} from '@/lib/types/analytics';
import { 
  fetchRealAnalyticsSummary, 
  fetchRealPerformanceMetrics,
  fetchProfitLossData,
  fetchBettingTrends,
  fetchSportPerformance,
  fetchBookmakerPerformance,
  exportAnalyticsData,
  subscribeToAnalyticsUpdates
} from '@/lib/api/analytics-api';

interface UseAnalyticsOptions {
  userId: string;
  enableRealtime?: boolean;
}

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  performanceMetrics: PerformanceMetrics | null;
  profitLossData: ProfitLossData[];
  bettingTrends: BettingTrend[];
  sportPerformance: SportPerformance[];
  bookmakerPerformance: BookmakerPerformance[];
  filters: AnalyticsFilters;
  dateRange: DateRange;
}

interface AnalyticsActions {
  setFilters: (filters: AnalyticsFilters) => void;
  setDateRange: (dateRange: DateRange) => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'pdf' | 'csv') => Promise<void>;
}

export function useAnalytics({ userId, enableRealtime = false }: UseAnalyticsOptions) {
  // State management
  const [state, setState] = useState<AnalyticsState>({
    summary: null,
    performanceMetrics: null,
    profitLossData: [],
    bettingTrends: [],
    sportPerformance: [],
    bookmakerPerformance: [],
    filters: {},
    dateRange: { from: new Date(), to: new Date() }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [summary, performanceMetrics, profitLossData, bettingTrends, sportPerformance, bookmakerPerformance] = await Promise.all([
        fetchRealAnalyticsSummary(userId, state.dateRange, state.filters),
        fetchRealPerformanceMetrics(userId, state.dateRange, state.filters),
        fetchProfitLossData(userId, 'day', state.dateRange, state.filters),
        fetchBettingTrends(userId, 'week', state.dateRange, state.filters),
        fetchSportPerformance(userId, state.dateRange, state.filters),
        fetchBookmakerPerformance(userId, state.dateRange, state.filters)
      ]);

      setState(prev => ({
        ...prev,
        summary,
        performanceMetrics,
        profitLossData,
        bettingTrends,
        sportPerformance,
        bookmakerPerformance
      }));
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    } finally {
      setIsLoading(false);
    }
  }, [userId, state.dateRange, state.filters]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const unsubscribe = subscribeToAnalyticsUpdates(userId, (payload) => {
      console.log('Analytics update received:', payload);
      // Refresh data when changes occur
      loadAnalyticsData();
    });

    return unsubscribe;
  }, [userId, enableRealtime, loadAnalyticsData]);

  // Actions
  const actions: AnalyticsActions = {
    setFilters: useCallback((filters: AnalyticsFilters) => {
      setState(prev => ({ ...prev, filters }));
    }, []),

    setDateRange: useCallback((dateRange: DateRange) => {
      setState(prev => ({ ...prev, dateRange }));
    }, []),

    refreshData: useCallback(async () => {
      await loadAnalyticsData();
    }, [loadAnalyticsData]),

    exportData: useCallback(async (format: 'pdf' | 'csv') => {
      if (!userId) return;
      
      setIsExporting(true);
      setExportError(null);
      
      try {
        const result = await exportAnalyticsData(userId, format, state.dateRange, state.filters);
        
        if (result.success && result.downloadUrl) {
          // Create download link
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          throw new Error(result.error || 'Export sikertelen');
        }
      } catch (err) {
        console.error('Export error:', err);
        setExportError(err instanceof Error ? err.message : 'Export hiba');
      } finally {
        setIsExporting(false);
      }
    }, [userId, state.dateRange, state.filters])
  };

  return {
    state,
    actions,
    isLoading,
    error,
    isExporting,
    exportError
  };
}
