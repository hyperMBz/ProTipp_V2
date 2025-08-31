import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/lib/providers/auth-provider';
import { useBetHistoryWithFallback } from './use-bet-history';
import { 
  AnalyticsDataProcessor,
  ProfitLossData,
  ROITrendData,
  WinRateData,
  SportPerformanceData,
  BookmakerPerformanceData,
  PerformanceReport
} from '@/lib/analytics/data-processor';
import { ExportEngine, ExportOptions, ExportResult } from '@/lib/analytics/export-engine';
import { BetHistoryItem } from '@/lib/mock-data';
import { useState, useCallback } from 'react';
import type { Database } from '@/lib/supabase/client';

type BetHistory = Database['public']['Tables']['bet_history']['Row'];
type UnifiedBetHistory = BetHistoryItem | BetHistory;

export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  profitLoss: (timeframe: string) => ['analytics', 'profit-loss', timeframe] as const,
  roiTrends: (timeframe: string) => ['analytics', 'roi-trends', timeframe] as const,
  winRate: (timeframe: string) => ['analytics', 'win-rate', timeframe] as const,
  sportPerformance: () => ['analytics', 'sport-performance'] as const,
  bookmakerPerformance: () => ['analytics', 'bookmaker-performance'] as const,
  performanceReport: (startDate: string, endDate: string) => ['analytics', 'performance-report', startDate, endDate] as const,
} as const;

/**
 * Hook for profit/loss analytics data
 */
export function useProfitLossAnalytics(timeframe: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.profitLoss(timeframe),
    queryFn: (): ProfitLossData[] => {
      const betHistory = betHistoryQuery.data || [];
      return AnalyticsDataProcessor.calculateProfitLossData(betHistory, timeframe);
    },
    enabled: betHistoryQuery.data !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for ROI trends analytics data
 */
export function useROITrendsAnalytics(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.roiTrends(timeframe),
    queryFn: (): ROITrendData[] => {
      const betHistory = betHistoryQuery.data || [];
      return AnalyticsDataProcessor.calculateROITrends(betHistory, timeframe);
    },
    enabled: betHistoryQuery.data !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for win rate analytics data
 */
export function useWinRateAnalytics(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.winRate(timeframe),
    queryFn: (): WinRateData[] => {
      const betHistory = betHistoryQuery.data || [];
      return AnalyticsDataProcessor.calculateWinRateAnalysis(betHistory, timeframe);
    },
    enabled: betHistoryQuery.data !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for sport performance analytics data
 */
export function useSportPerformanceAnalytics() {
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.sportPerformance(),
    queryFn: (): SportPerformanceData[] => {
      const betHistory = betHistoryQuery.data || [];
      return AnalyticsDataProcessor.calculateSportPerformance(betHistory);
    },
    enabled: betHistoryQuery.data !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for bookmaker performance analytics data
 */
export function useBookmakerPerformanceAnalytics() {
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.bookmakerPerformance(),
    queryFn: (): BookmakerPerformanceData[] => {
      const betHistory = betHistoryQuery.data || [];
      return AnalyticsDataProcessor.calculateBookmakerPerformance(betHistory);
    },
    enabled: betHistoryQuery.data !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for performance report generation
 */
export function usePerformanceReport(
  startDate: Date,
  endDate: Date,
  reportType: 'daily' | 'weekly' | 'monthly' = 'monthly'
) {
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.performanceReport(
      startDate.toISOString(),
      endDate.toISOString()
    ),
    queryFn: (): PerformanceReport => {
      const betHistory = betHistoryQuery.data || [];
      return AnalyticsDataProcessor.generatePerformanceReport(
        betHistory,
        startDate,
        endDate,
        reportType
      );
    },
    enabled: betHistoryQuery.data !== undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for Kelly Criterion calculations
 */
export function useKellyCriterion(winProbability: number, odds: number) {
  return useQuery({
    queryKey: ['kelly-criterion', winProbability, odds],
    queryFn: (): number => {
      return AnalyticsDataProcessor.calculateKellyCriterion(winProbability, odds);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for Sharpe ratio calculations
 */
export function useSharpeRatio(returns: number[], riskFreeRate: number = 0.02) {
  return useQuery({
    queryKey: ['sharpe-ratio', returns.length, riskFreeRate],
    queryFn: (): number => {
      return AnalyticsDataProcessor.calculateSharpeRatio(returns, riskFreeRate);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for bet history export functionality
 */
export function useBetHistoryExport() {
  const queryClient = useQueryClient();
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useMutation({
    mutationFn: async (options: ExportOptions): Promise<ExportResult> => {
      const betHistory = betHistoryQuery.data || [];
      return ExportEngine.exportBetHistory(betHistory, options);
    },
    onSuccess: (result) => {
      if (result.success && result.data instanceof Blob) {
        ExportEngine.downloadFile(result.data, result.filename);
      }
    },
  });
}

/**
 * Hook for analytics report export functionality
 */
export function useAnalyticsExport() {
  const queryClient = useQueryClient();
  const betHistoryQuery = useBetHistoryWithFallback();
  
  return useMutation({
    mutationFn: async (options: ExportOptions): Promise<ExportResult> => {
      const betHistory = betHistoryQuery.data || [];
      return ExportEngine.exportAnalyticsReport(betHistory, options);
    },
    onSuccess: (result) => {
      if (result.success && result.data instanceof Blob) {
        ExportEngine.downloadFile(result.data, result.filename);
      }
    },
  });
}

/**
 * Hook for comprehensive analytics data
 */
export function useComprehensiveAnalytics(timeframe: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const profitLossQuery = useProfitLossAnalytics(timeframe);
  const roiTrendsQuery = useROITrendsAnalytics(timeframe);
  const winRateQuery = useWinRateAnalytics(timeframe);
  const sportPerformanceQuery = useSportPerformanceAnalytics();
  const bookmakerPerformanceQuery = useBookmakerPerformanceAnalytics();
  
  const isLoading = profitLossQuery.isLoading || 
                   roiTrendsQuery.isLoading || 
                   winRateQuery.isLoading || 
                   sportPerformanceQuery.isLoading || 
                   bookmakerPerformanceQuery.isLoading;
  
  const error = profitLossQuery.error || 
                roiTrendsQuery.error || 
                winRateQuery.error || 
                sportPerformanceQuery.error || 
                bookmakerPerformanceQuery.error;
  
  return {
    profitLoss: profitLossQuery.data || [],
    roiTrends: roiTrendsQuery.data || [],
    winRate: winRateQuery.data || [],
    sportPerformance: sportPerformanceQuery.data || [],
    bookmakerPerformance: bookmakerPerformanceQuery.data || [],
    isLoading,
    error,
    refetch: () => {
      profitLossQuery.refetch();
      roiTrendsQuery.refetch();
      winRateQuery.refetch();
      sportPerformanceQuery.refetch();
      bookmakerPerformanceQuery.refetch();
    },
  };
}

/**
 * Hook for real-time analytics updates
 */
export function useRealTimeAnalytics(timeframe: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const comprehensiveAnalytics = useComprehensiveAnalytics(timeframe);
  
  // In a real implementation, you would set up WebSocket connections
  // to receive real-time updates for analytics data
  // For now, we'll just return the current data with a refresh mechanism
  
  return {
    ...comprehensiveAnalytics,
    isRealTime: true,
    lastUpdate: new Date(),
  };
}

/**
 * Hook for analytics configuration management
 */
export function useAnalyticsConfig() {
  const [config, setConfig] = useState({
    defaultTimeframe: 'daily' as 'daily' | 'weekly' | 'monthly',
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    showCharts: true,
    showTables: true,
    exportFormat: 'csv' as 'csv' | 'excel' | 'pdf',
  });
  
  const updateConfig = useCallback((updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  return {
    config,
    updateConfig,
  };
}

/**
 * Hook for analytics filters
 */
export function useAnalyticsFilters() {
  const [filters, setFilters] = useState({
    sport: 'all',
    bookmaker: 'all',
    status: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    minProfit: 0,
    maxProfit: Infinity,
    minOdds: 1,
    maxOdds: Infinity,
  });
  
  const updateFilters = useCallback((updates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
      sport: 'all',
      bookmaker: 'all',
      status: 'all',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      minProfit: 0,
      maxProfit: Infinity,
      minOdds: 1,
      maxOdds: Infinity,
    });
  }, []);
  
  return {
    filters,
    updateFilters,
    resetFilters,
  };
}
