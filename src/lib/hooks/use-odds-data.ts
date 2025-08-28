import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import {
  oddsApiClient,
  fetchArbitrageOpportunities,
  ProcessedOddsData,
  OddsApiSport,
  ArbitrageCalculationResult
} from '@/lib/api/odds-api';
import { ArbitrageOpportunity } from '@/lib/mock-data';

// Query keys for React Query caching
export const QUERY_KEYS = {
  SPORTS: ['sports'] as const,
  ODDS: (sport: string) => ['odds', sport] as const,
  ARBITRAGE: (sports: string[]) => ['arbitrage', ...sports] as const,
  USAGE_STATS: ['usage-stats'] as const,
} as const;

// Hook to get available sports
export function useSports() {
  return useQuery({
    queryKey: QUERY_KEYS.SPORTS,
    queryFn: () => oddsApiClient.getSports(),
    staleTime: 24 * 60 * 60 * 1000, // Sports list doesn't change often - cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!process.env.NEXT_PUBLIC_ODDS_API_KEY,
  });
}

// Hook to get odds for a specific sport
export function useOdds(sport: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ODDS(sport),
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
      queryKey: QUERY_KEYS.ODDS(sport),
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
    queryKey: QUERY_KEYS.ARBITRAGE(sports),
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
    queryKey: QUERY_KEYS.USAGE_STATS,
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

// Helper hook for real-time detection
export function useRealTimeStatus() {
  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
  const isRealTime = !!apiKey && apiKey !== 'your_odds_api_key_here';

  return {
    isRealTime,
    isDemo: !isRealTime,
    apiConfigured: !!apiKey,
  };
}

// Hook for fallback to mock data when API is not available
export function useArbitrageWithFallback(sports: string[] = ['soccer_epl', 'basketball_nba', 'tennis_atp']) {
  const { isRealTime } = useRealTimeStatus();
  const realDataQuery = useArbitrageOpportunities(sports);

  // Import mock data dynamically to avoid bundle issues
  const mockData = async () => {
    const { mockArbitrageOpportunities } = await import('@/lib/mock-data');
    return mockArbitrageOpportunities;
  };

  const mockDataQuery = useQuery({
    queryKey: ['mock-arbitrage'],
    queryFn: mockData,
    enabled: !isRealTime,
    staleTime: Infinity, // Mock data doesn't change
  });

  if (isRealTime) {
    return {
      ...realDataQuery,
      isRealTime: true,
      fallbackMode: false,
    };
  }

  return {
    ...mockDataQuery,
    isRealTime: false,
    fallbackMode: true,
  };
}
