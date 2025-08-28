import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/lib/providers/auth-provider';
import { getSupabaseClient } from '@/lib/supabase-singleton';
import type { Database } from '@/lib/supabase/client';

type BetHistory = Database['public']['Tables']['bet_history']['Row'];
type BetHistoryInsert = Database['public']['Tables']['bet_history']['Insert'];
type BetHistoryUpdate = Database['public']['Tables']['bet_history']['Update'];

export const BET_HISTORY_QUERY_KEYS = {
  all: ['bet-history'] as const,
  user: (userId: string) => ['bet-history', userId] as const,
  userFiltered: (userId: string, filters: Record<string, unknown>) => ['bet-history', userId, filters] as const,
  stats: (userId: string) => ['bet-history-stats', userId] as const,
} as const;

// Hook to get user's bet history
export function useBetHistory(filters?: {
  sport?: string;
  status?: string;
  bookmaker?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const user = useUser();
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: BET_HISTORY_QUERY_KEYS.userFiltered(user?.id || '', filters || {}),
    queryFn: async (): Promise<BetHistory[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('bet_history')
        .select('*')
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });

      // Apply filters
      if (filters?.sport) {
        query = query.eq('sport', filters.sport);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.bookmaker) {
        query = query.eq('bookmaker', filters.bookmaker);
      }
      if (filters?.dateFrom) {
        query = query.gte('placed_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('placed_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get user's bet history statistics
export function useBetHistoryStats() {
  const user = useUser();
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: BET_HISTORY_QUERY_KEYS.stats(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id });

      if (error) {
        throw error;
      }

      return data?.[0] || {
        total_bets: 0,
        total_wagered: 0,
        total_profit: 0,
        win_rate: 0,
        avg_odds: 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to add a new bet
export function useAddBet() {
  const user = useUser();
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (betData: Omit<BetHistoryInsert, 'user_id' | 'id'>): Promise<BetHistory> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('bet_history')
        .insert({
          ...betData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch bet history queries
      queryClient.invalidateQueries({ queryKey: BET_HISTORY_QUERY_KEYS.user(user?.id || '') });
      queryClient.invalidateQueries({ queryKey: BET_HISTORY_QUERY_KEYS.stats(user?.id || '') });
    },
  });
}

// Hook to update a bet
export function useUpdateBet() {
  const user = useUser();
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BetHistoryUpdate }): Promise<BetHistory> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('bet_history')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own bets
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BET_HISTORY_QUERY_KEYS.user(user?.id || '') });
      queryClient.invalidateQueries({ queryKey: BET_HISTORY_QUERY_KEYS.stats(user?.id || '') });
    },
  });
}

// Hook to delete a bet
export function useDeleteBet() {
  const user = useUser();
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (betId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('bet_history')
        .delete()
        .eq('id', betId)
        .eq('user_id', user.id); // Ensure user can only delete their own bets

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BET_HISTORY_QUERY_KEYS.user(user?.id || '') });
      queryClient.invalidateQueries({ queryKey: BET_HISTORY_QUERY_KEYS.stats(user?.id || '') });
    },
  });
}

// Hook with fallback to mock data when user is not authenticated
export function useBetHistoryWithFallback(filters?: {
  sport?: string;
  status?: string;
  bookmaker?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const user = useUser();
  const realDataQuery = useBetHistory(filters);

  // Import mock data dynamically to avoid bundle issues
  const mockDataQuery = useQuery({
    queryKey: ['mock-bet-history', filters],
    queryFn: async () => {
      const { mockBetHistory } = await import('@/lib/mock-data');

      // Apply mock filters
      let filteredData = mockBetHistory;

      if (filters?.sport && typeof filters.sport === 'string') {
        filteredData = filteredData.filter(bet => bet.sport === filters.sport);
      }
      if (filters?.status && typeof filters.status === 'string') {
        filteredData = filteredData.filter(bet => bet.status === filters.status);
      }
      if (filters?.bookmaker && typeof filters.bookmaker === 'string') {
        filteredData = filteredData.filter(bet => bet.bookmaker === filters.bookmaker);
      }

      return filteredData;
    },
    enabled: !user,
    staleTime: Infinity, // Mock data doesn't change
  });

  if (user) {
    return {
      ...realDataQuery,
      isAuthenticated: true,
      isUsingMockData: false,
    };
  }

  return {
    ...mockDataQuery,
    isAuthenticated: false,
    isUsingMockData: true,
  };
}
