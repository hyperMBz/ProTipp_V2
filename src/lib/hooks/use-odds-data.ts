import { useQuery, useQueries, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  oddsApiClient,
  fetchArbitrageOpportunities,
  ProcessedOddsData,
  ArbitrageCalculationResult
} from '@/lib/api/odds-api';
import { ArbitrageOpportunity } from '@/lib/mock-data';
import { useBookmakerOdds, useAggregatedOdds } from './use-bookmakers';
import { RealTimeOdds } from '@/lib/api/bookmakers/base';
import { useState, useEffect, useMemo } from 'react';
import { useRealTime } from './use-real-time';

// Query keys for React Query caching
const ODDS_QUERY_KEY = 'odds';
const ARBITRAGE_QUERY_KEY = 'arbitrage';
const BOOKMAKER_ODDS_QUERY_KEY = 'bookmaker-odds';
const AGGREGATED_ODDS_QUERY_KEY = 'aggregated-odds';

// Hook to get available sports
export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: () => oddsApiClient.getSports(),
    staleTime: 24 * 60 * 60 * 1000, // Sports list doesn't change often - cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!process.env.NEXT_PUBLIC_ODDS_API_KEY,
  });
}

// Hook to get odds for a specific sport
export function useOdds(sport: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [ODDS_QUERY_KEY, sport],
    queryFn: () => oddsApiClient.getOdds(sport, ['h2h'], ['us', 'eu']),
    staleTime: 30 * 1000, // Odds change frequently - refresh every 30 seconds
    gcTime: 5 * 60 * 1000,
    enabled: enabled && !!process.env.NEXT_PUBLIC_ODDS_API_KEY && !!sport,
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

// Hook to get odds for multiple sports
export function useMultipleSportsOdds(sports: string[]) {
  return useQueries({
    queries: sports.map(sport => ({
      queryKey: [ODDS_QUERY_KEY, sport],
      queryFn: () => oddsApiClient.getOdds(sport, ['h2h'], ['us', 'eu']),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!process.env.NEXT_PUBLIC_ODDS_API_KEY && !!sport,
      refetchInterval: 60 * 1000,
    })),
  });
}

// Main hook for arbitrage opportunities
export function useArbitrageOpportunities(sports: string[] = ['soccer_epl', 'basketball_nba', 'tennis_atp']) {
  return useQuery({
    queryKey: [ARBITRAGE_QUERY_KEY, ...sports],
    queryFn: () => fetchArbitrageOpportunities(sports),
    staleTime: 30 * 1000, // Refresh every 30 seconds
    gcTime: 5 * 60 * 1000,
    enabled: !!process.env.NEXT_PUBLIC_ODDS_API_KEY && sports.length > 0,
    refetchInterval: 45 * 1000, // Auto-refetch every 45 seconds
    select: (data: ProcessedOddsData[]) => transformToArbitrageOpportunities(data),
  });
}

// Hook for API usage statistics
export function useApiUsage() {
  return useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => oddsApiClient.getUsageStats(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!process.env.NEXT_PUBLIC_ODDS_API_KEY,
    refetchInterval: 5 * 60 * 1000, // Check usage every 5 minutes
  });
}

// Transform ProcessedOddsData to our existing ArbitrageOpportunity format
function transformToArbitrageOpportunities(data: ProcessedOddsData[]): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  data.forEach((eventData, eventIndex) => {
    eventData.markets.forEach((market, marketIndex) => {
      market.arbitrageOpportunities.forEach((arb, arbIndex) => {
        const timeToExpiry = calculateTimeToExpiry(eventData.commenceTime);

        opportunities.push({
          id: `real_${eventIndex}_${marketIndex}_${arbIndex}`,
          sport: eventData.sport,
          event: eventData.event,
          outcome: `${arb.bookmaker1.outcome} vs ${arb.bookmaker2.outcome}`,
          profitMargin: arb.profitMargin,
          bet1: {
            bookmaker: arb.bookmaker1.name,
            odds: arb.bookmaker1.odds,
            outcome: arb.bookmaker1.outcome,
          },
          bet2: {
            bookmaker: arb.bookmaker2.name,
            odds: arb.bookmaker2.odds,
            outcome: arb.bookmaker2.outcome,
          },
          stakes: {
            bet1: {
              stake: arb.bookmaker1.stake,
              profit: arb.bookmaker1.stake * arb.bookmaker1.odds,
            },
            bet2: {
              stake: arb.bookmaker2.stake,
              profit: arb.bookmaker2.stake * arb.bookmaker2.odds,
            },
          },
          totalStake: arb.totalStake,
          expectedProfit: arb.expectedProfit,
          timeToExpiry,
          probability: arb.probability,
          category: 'arbitrage',
        });
      });
    });
  });

  return opportunities;
}

// Calculate time to expiry string from Date
function calculateTimeToExpiry(commenceTime: Date): string {
  const now = new Date();
  const diffMs = commenceTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "00:00:00";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
}

// Real-time status hook with connection management
export function useRealTimeStatus() {
  const [isRealTime, setIsRealTime] = useState(false); // Alapértelmezetten false demo módban
  const [isClient, setIsClient] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
  
  // Prevent hydration mismatch by only updating state on client
  useEffect(() => {
    setIsClient(true);
    // Set real-time status only after client-side hydration
    if (apiKey && apiKey !== 'your_odds_api_key_here') {
      setIsRealTime(true);
    }
  }, [apiKey]);
  
  // Ensure consistent server/client state during hydration
  const isDemo = !isClient || !isRealTime || !apiKey || apiKey === 'your_odds_api_key_here';
  
  // Real-time connection status
  const {
    isConnected,
    connectionStatus,
    currentMethod,
    latency,
    error,
    isConnecting,
    connect,
    disconnect,
    switchMethod,
    refreshConnection
  } = useRealTime({
    autoConnect: isClient && isRealTime, // Only auto-connect on client and when real-time is enabled
    preferredMethod: 'websocket',
    enablePolling: true
  });
  
  return {
    isRealTime: isClient ? isRealTime : false, // Return false during SSR
    setIsRealTime,
    toggleRealTime: () => setIsRealTime(!isRealTime),
    isDemo,
    apiConfigured: !!apiKey,
    // Real-time connection info
    isConnected: isClient ? isConnected : false,
    connectionStatus: isClient ? connectionStatus : 'disconnected',
    currentMethod: isClient ? currentMethod : 'none',
    latency: isClient ? latency : 0,
    connectionError: isClient ? error : null,
    isConnecting: isClient ? isConnecting : false,
    connect,
    disconnect,
    switchMethod,
    refreshConnection
  };
}

// Hook for fallback to mock data when API is not available
export function useArbitrageWithFallback(sports: string[] = ['soccer_epl', 'basketball_nba', 'tennis_atp']) {
  const { isRealTime, isDemo } = useRealTimeStatus();
  const realDataQuery = useArbitrageOpportunities(sports);

  // Import mock data dynamically to avoid bundle issues
  const mockData = async () => {
    const { mockArbitrageOpportunities } = await import('@/lib/mock-data');
    return mockArbitrageOpportunities;
  };

  const mockDataQuery = useQuery({
    queryKey: ['mock-arbitrage'],
    queryFn: mockData,
    enabled: true, // Always enabled for demo
    staleTime: Infinity, // Mock data doesn't change
  });

  // Always return mock data for now (demo mode)
  return {
    ...mockDataQuery,
    isRealTime: false,
    fallbackMode: true,
  };
}

// Enhanced hook that integrates bookmaker data with existing odds system
export function useEnhancedArbitrageOpportunities(sports: string[] = ['soccer_epl', 'basketball_nba', 'tennis_atp']) {
  const { isRealTime } = useRealTimeStatus();
  
  // Get data from new bookmaker integrations
  const bookmakerQueries = useQueries({
    queries: sports.map(sport => ({
      queryKey: [BOOKMAKER_ODDS_QUERY_KEY, sport],
      queryFn: async () => {
        const manager = await import('@/lib/api/bookmakers/manager');
        return manager.getBookmakerManager().getOdds(sport);
      },
      staleTime: 15 * 1000, // 15 seconds
      refetchInterval: 30 * 1000, // 30 seconds
      enabled: isRealTime,
    })),
  });

  // Get aggregated odds from bookmakers
  const aggregatedQueries = useQueries({
    queries: sports.map(sport => ({
      queryKey: [AGGREGATED_ODDS_QUERY_KEY, sport],
      queryFn: async () => {
        const manager = await import('@/lib/api/bookmakers/manager');
        return manager.getBookmakerManager().getAggregatedOdds(sport);
      },
      staleTime: 15 * 1000,
      refetchInterval: 30 * 1000,
      enabled: isRealTime,
    })),
  });

  // Get data from existing The Odds API
  const existingOddsQuery = useArbitrageOpportunities(sports);

  // Combine and prioritize data sources
  const combinedData = {
    bookmakerData: bookmakerQueries.map((query: UseQueryResult) => query.data).filter(Boolean),
    aggregatedData: aggregatedQueries.map((query: UseQueryResult) => query.data).filter(Boolean),
    existingData: existingOddsQuery.data,
    isLoading: bookmakerQueries.some((q: UseQueryResult) => q.isLoading) || 
               aggregatedQueries.some((q: UseQueryResult) => q.isLoading) || 
               existingOddsQuery.isLoading,
    error: bookmakerQueries.find((q: UseQueryResult) => q.error)?.error || 
           aggregatedQueries.find((q: UseQueryResult) => q.error)?.error || 
           existingOddsQuery.error,
  };

  return {
    ...combinedData,
    isRealTime,
    hasBookmakerData: combinedData.bookmakerData.length > 0,
    hasAggregatedData: combinedData.aggregatedData.length > 0,
    dataSource: combinedData.bookmakerData.length > 0 ? 'bookmakers' : 
                combinedData.existingData ? 'odds-api' : 'none',
  };
}

// Hook for bookmaker-specific odds data
export function useBookmakerSpecificOdds(sport: string, bookmakerId?: string) {
  const { odds: bookmakerOdds, isLoading, error } = useBookmakerOdds(sport);
  
  const filteredOdds = bookmakerId 
    ? bookmakerOdds?.filter((odds: RealTimeOdds) => odds.bookmaker_id === bookmakerId)
    : bookmakerOdds;

  return {
    data: filteredOdds,
    isLoading,
    error,
    bookmakerId,
    totalOdds: bookmakerOdds?.length || 0,
    filteredOdds: filteredOdds?.length || 0,
  };
}

// Hook for comparing odds across different bookmakers
export function useOddsComparison(sport: string, event?: string) {
  const { data: aggregatedOdds } = useAggregatedOdds(sport, event);
  
  const comparisonData = aggregatedOdds?.map((eventData: {
    event_name?: string;
    event?: string;
    sport: string;
    bookmakers?: Array<{
      bookmaker_name?: string;
      name?: string;
      odds?: Array<{ odds: number }>;
    }>;
    last_updated?: string;
    lastUpdate?: string;
  }) => ({
    event: eventData.event_name || eventData.event,
    sport: eventData.sport,
    bookmakers: (eventData.bookmakers || []).map((bookmaker) => ({
      name: bookmaker.bookmaker_name || bookmaker.name,
      odds: bookmaker.odds || [],
      averageOdds: (bookmaker.odds || []).reduce((sum: number, odd) => sum + odd.odds, 0) / (bookmaker.odds || []).length,
      bestOdds: Math.max(...(bookmaker.odds || []).map((odd) => odd.odds)),
      worstOdds: Math.min(...(bookmaker.odds || []).map((odd) => odd.odds)),
    })),
    lastUpdated: eventData.last_updated || eventData.lastUpdate,
  }));

  return {
    data: comparisonData,
    isLoading: false, // This is derived from aggregated odds
    eventCount: comparisonData?.length || 0,
    bookmakerCount: comparisonData?.[0]?.bookmakers.length || 0,
  };
}

// Real-time odds hook with automatic updates
export function useRealTimeOddsData(sport: string, enabled: boolean = true) {
  const queryClient = useQueryClient();
  
  // Memoize sport and enabled to prevent unnecessary re-renders
  const memoizedSport = useMemo(() => sport, [sport]);
  const memoizedEnabled = useMemo(() => enabled, [enabled]);
  
  // Get real-time connection status
  const {
    isConnected,
    connectionStatus,
    currentMethod
  } = useRealTime({
    autoConnect: true,
    preferredMethod: 'websocket'
  });

  // Use existing odds query but with real-time updates
  const oddsQuery = useQuery({
    queryKey: [ODDS_QUERY_KEY, memoizedSport, 'realtime'],
    queryFn: () => oddsApiClient.getOdds(memoizedSport, ['h2h'], ['us', 'eu']),
    staleTime: isConnected ? 5 * 1000 : 30 * 1000, // Faster updates when connected
    gcTime: 5 * 60 * 1000,
    enabled: memoizedEnabled && !!process.env.NEXT_PUBLIC_ODDS_API_KEY && !!memoizedSport,
    refetchInterval: isConnected ? 10 * 1000 : 60 * 1000, // More frequent updates when connected
  });

  // Listen for real-time odds updates
  useEffect(() => {
    if (!isConnected) return;

    const handleOddsUpdate = (data: { bookmaker_id: string; event_id: string; market: string; outcome: string; odds: number; timestamp: Date }) => {
      // Update the query cache with new odds data
      queryClient.setQueryData([ODDS_QUERY_KEY, memoizedSport, 'realtime'], (oldData: unknown) => {
        if (!oldData) return oldData;
        
        // Update specific odds in the existing data
        return {
          ...oldData,
          // Update odds based on the real-time update
          // This is a simplified update - in production you'd merge more intelligently
          lastUpdate: new Date().toISOString(),
          realTimeUpdate: data
        };
      });
    };

    // Subscribe to odds updates for this sport
    // This would be handled by the real-time connection manager
    return () => {
      // Cleanup subscription
    };
  }, [isConnected, memoizedSport, queryClient]);

  return {
    ...oddsQuery,
    isConnected,
    connectionStatus,
    currentMethod,
    realTimeUpdate: (oddsQuery.data as any)?.realTimeUpdate,
    lastUpdate: (oddsQuery.data as any)?.lastUpdate,
  };
}

// Enhanced arbitrage hook with real-time capabilities
export function useRealTimeArbitrageOpportunities(sports: string[] = ['soccer_epl', 'basketball_nba', 'tennis_atp']) {
  const queryClient = useQueryClient();
  
  // Memoize sports array to prevent unnecessary re-renders
  const memoizedSports = useMemo(() => sports, [sports]);
  
  // Get real-time connection status
  const {
    isConnected,
    connectionStatus,
    currentMethod
  } = useRealTime({
    autoConnect: true,
    preferredMethod: 'websocket'
  });

  // Use existing arbitrage query with real-time enhancements
  const arbitrageQuery = useQuery({
    queryKey: [ARBITRAGE_QUERY_KEY, 'realtime', ...memoizedSports],
    queryFn: () => fetchArbitrageOpportunities(memoizedSports),
    staleTime: isConnected ? 5 * 1000 : 30 * 1000, // Faster updates when connected
    gcTime: 5 * 60 * 1000,
    enabled: !!process.env.NEXT_PUBLIC_ODDS_API_KEY && memoizedSports.length > 0,
    refetchInterval: isConnected ? 15 * 1000 : 45 * 1000, // More frequent updates when connected
    select: (data: ProcessedOddsData[]) => transformToArbitrageOpportunities(data),
  });

  // Listen for real-time arbitrage updates
  useEffect(() => {
    if (!isConnected) return;

    const handleArbitrageUpdate = (data: { bookmaker_id: string; event_id: string; market: string; outcome: string; odds: number; timestamp: Date }) => {
      // Update the query cache with new arbitrage opportunities
      queryClient.setQueryData([ARBITRAGE_QUERY_KEY, 'realtime', ...memoizedSports], (oldData: unknown) => {
        if (!oldData) return oldData;
        
        // Merge new arbitrage opportunities with existing ones
        return {
          ...oldData,
          lastUpdate: new Date().toISOString(),
          realTimeUpdate: data
        };
      });
    };

    // Subscribe to arbitrage updates
    // This would be handled by the real-time connection manager
    return () => {
      // Cleanup subscription
    };
  }, [isConnected, memoizedSports, queryClient]);

  return {
    ...arbitrageQuery,
    isConnected,
    connectionStatus,
    currentMethod,
    realTimeUpdate: (arbitrageQuery.data as any)?.realTimeUpdate,
    lastUpdate: (arbitrageQuery.data as any)?.lastUpdate,
  };
}
