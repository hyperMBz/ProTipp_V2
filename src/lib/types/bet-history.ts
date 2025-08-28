// Unified bet history type that works with both database and mock data
export interface UnifiedBetHistory {
  id: string;
  user_id?: string;
  event_name?: string;
  event?: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake: number;
  outcome: string;
  status: 'pending' | 'won' | 'lost' | 'refunded' | 'cancelled';
  placed_at?: string;
  placedAt?: Date;
  settled_at?: string | null;
  settledAt?: Date;
  profit?: number | null;
  clv?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Helper functions to work with unified type
export const getBetEventName = (bet: UnifiedBetHistory): string => {
  return bet.event_name || bet.event || '';
};

export const getBetPlacedDate = (bet: UnifiedBetHistory): Date => {
  if (bet.placed_at) {
    return new Date(bet.placed_at);
  }
  if (bet.placedAt) {
    return bet.placedAt;
  }
  return new Date();
};

export const getBetSettledDate = (bet: UnifiedBetHistory): Date | null => {
  if (bet.settled_at) {
    return new Date(bet.settled_at);
  }
  if (bet.settledAt) {
    return bet.settledAt;
  }
  return null;
};

export const getBetProfit = (bet: UnifiedBetHistory): number => {
  return bet.profit || 0;
};

export const getBetCLV = (bet: UnifiedBetHistory): number => {
  return bet.clv || 0;
};
