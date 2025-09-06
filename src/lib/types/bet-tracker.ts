import { ArbitrageOpportunity } from "@/lib/mock-data";

export interface BetTrackerItem {
  id: string;
  user_id: string;
  opportunity_id: string;
  event_name: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake?: number;
  outcome: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  added_at: Date;
  settled_at?: Date;
  profit?: number;
  clv?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BetTrackerContextType {
  trackedBets: BetTrackerItem[];
  addToTracker: (opportunity: ArbitrageOpportunity, stake?: number, notes?: string) => Promise<void>;
  removeFromTracker: (id: string) => Promise<void>;
  updateBet: (id: string, updates: Partial<BetTrackerItem>) => Promise<void>;
  clearTracker: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface BetTrackerButtonProps {
  opportunity: ArbitrageOpportunity;
  onAdd: (opportunity: ArbitrageOpportunity) => void;
  isAdded: boolean;
  isLoading?: boolean;
}

export interface BetTrackerPanelProps {
  opportunities: BetTrackerItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BetTrackerItem>) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export interface BetTrackerItemProps {
  bet: BetTrackerItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BetTrackerItem>) => void;
  isEditing?: boolean;
}

export interface BetTrackerProviderProps {
  children: React.ReactNode;
}

// API Types
export interface AddBetRequest {
  opportunity_id: string;
  event_name: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake?: number;
  outcome: string;
  notes?: string;
}

export interface UpdateBetRequest {
  stake?: number;
  notes?: string;
  status?: 'pending' | 'won' | 'lost' | 'cancelled';
}

export interface GetTrackedBetsResponse {
  bets: BetTrackerItem[];
  total: number;
}

export interface BetTrackerStats {
  totalBets: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  totalStaked: number;
  totalProfit: number;
  winRate: number;
  averageOdds: number;
}
