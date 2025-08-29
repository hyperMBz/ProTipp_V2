// React hooks for bookmaker data management
// Story 1.1 Task 4: Create React Hooks for Bookmaker Data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getBookmakerManager, BookmakerManagerConfig, AggregatedOdds } from '../api/bookmakers/manager';
import { RealTimeOdds, BookmakerEvent, BookmakerIntegration } from '../api/bookmakers/base';
import { BookmakerAPI } from '../api/bookmakers/base';

interface UseBookmakersConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  enabled: boolean;
}

interface BookmakerStats {
  totalBookmakers: number;
  activeBookmakers: number;
  errorBookmakers: number;
  lastUpdate: Date;
}

export function useBookmakers(config: UseBookmakersConfig = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  enabled: true
}) {
  const queryClient = useQueryClient();
  const [manager] = useState(() => getBookmakerManager());

  // Query for bookmaker status
  const statusQuery = useQuery({
    queryKey: ['bookmakers', 'status'],
    queryFn: () => manager.getBookmakerStatus(),
    enabled: config.enabled,
    refetchInterval: config.autoRefresh ? config.refreshInterval : false,
    staleTime: 10000, // 10 seconds
  });

  // Query for bookmaker statistics
  const statsQuery = useQuery({
    queryKey: ['bookmakers', 'stats'],
    queryFn: () => manager.getCacheStats(),
    enabled: config.enabled,
    refetchInterval: config.autoRefresh ? config.refreshInterval : false,
    staleTime: 10000,
  });

  // Health check mutation
  const healthCheckMutation = useMutation({
    mutationFn: () => manager.checkAllHealth(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmakers'] });
    },
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      await manager.clearCache();
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmakers'] });
    },
  });

  return {
    status: statusQuery.data || [],
    stats: statsQuery.data,
    isLoading: statusQuery.isLoading || statsQuery.isLoading,
    error: statusQuery.error || statsQuery.error,
    refetch: () => {
      statusQuery.refetch();
      statsQuery.refetch();
    },
    checkHealth: () => healthCheckMutation.mutate(),
    clearCache: () => clearCacheMutation.mutate(),
    isHealthChecking: healthCheckMutation.isPending,
    isClearingCache: clearCacheMutation.isPending,
  };
}

export function useBookmakerOdds(sport?: string, event?: string, useCache: boolean = true) {
  const queryClient = useQueryClient();
  const [manager] = useState(() => getBookmakerManager());
  const [odds, setOdds] = useState<RealTimeOdds[]>([]);

  const oddsQuery = useQuery({
    queryKey: ['bookmakers', 'odds', sport, event, useCache],
    queryFn: () => manager.getOdds(sport, event, useCache),
    enabled: !!sport || !!event,
    refetchInterval: 30000, // 30 seconds
    staleTime: 5000, // 5 seconds
  });

  // Update local state when query data changes
  useEffect(() => {
    if (oddsQuery.data) {
      setOdds(prev => {
        // Merge new odds with existing ones, avoiding duplicates
        const oddsMap = new Map(prev.map(odd => [odd.id, odd]));
        oddsQuery.data.forEach(newOdd => {
          oddsMap.set(newOdd.id, newOdd);
        });
        return Array.from(oddsMap.values());
      });
    }
  }, [oddsQuery.data]);

  return {
    odds,
    isLoading: oddsQuery.isLoading,
    error: oddsQuery.error,
    refetch: oddsQuery.refetch,
  };
}

export function useBookmakerEvents(sport?: string) {
  const [manager] = useState(() => getBookmakerManager());

  return useQuery({
    queryKey: ['bookmakers', 'events', sport],
    queryFn: () => manager.getEvents(sport),
    enabled: !!sport,
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
  });
}

export function useBookmakerSports() {
  const [manager] = useState(() => getBookmakerManager());

  return useQuery({
    queryKey: ['bookmakers', 'sports'],
    queryFn: () => manager.getSports(),
    refetchInterval: 300000, // 5 minutes
    staleTime: 300000, // 5 minutes
  });
}

export function useAggregatedOdds(sport?: string, event?: string) {
  const [manager] = useState(() => getBookmakerManager());

  return useQuery({
    queryKey: ['bookmakers', 'aggregated-odds', sport, event],
    queryFn: () => manager.getAggregatedOdds(sport, event),
    enabled: !!sport || !!event,
    refetchInterval: 30000, // 30 seconds
    staleTime: 5000, // 5 seconds
  });
}

export function useBookmakerManager() {
  const [manager] = useState(() => getBookmakerManager());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initManager = async () => {
      try {
        await manager.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize bookmaker manager:', error);
      }
    };

    if (!isInitialized) {
      initManager();
    }
  }, [manager, isInitialized]);

  const addBookmaker = async (id: string, bookmaker: BookmakerAPI) => {
    manager.addBookmaker(id, bookmaker);
  };

  const removeBookmaker = async (bookmakerId: string) => {
    return manager.removeBookmaker(bookmakerId);
  };

  const resetManager = async () => {
    const { resetBookmakerManager } = await import('../api/bookmakers/manager');
    resetBookmakerManager();
    setIsInitialized(false);
  };

  return {
    manager,
    isInitialized,
    addBookmaker,
    removeBookmaker,
    resetManager,
  };
}

export function useBookmakerStats() {
  const { status } = useBookmakers();

  const stats: BookmakerStats = {
    totalBookmakers: status.length,
    activeBookmakers: status.filter(b => b.status === 'active').length,
    errorBookmakers: status.filter(b => b.status === 'error').length,
    lastUpdate: new Date(),
  };

  return stats;
}

export function useBookmakerFilter(bookmakers: BookmakerIntegration[], filters: {
  status?: 'active' | 'inactive' | 'error';
  apiType?: 'REST' | 'GraphQL' | 'WebSocket';
  searchTerm?: string;
}) {
  const filteredBookmakers = bookmakers.filter(bookmaker => {
    if (filters.status && bookmaker.status !== filters.status) {
      return false;
    }
    if (filters.apiType && bookmaker.api_type !== filters.apiType) {
      return false;
    }
    if (filters.searchTerm && !bookmaker.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return filteredBookmakers;
}
