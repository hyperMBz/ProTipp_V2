import { createSupabaseClient } from "@/lib/supabase/client";
import { 
  BetTrackerItem, 
  AddBetRequest, 
  UpdateBetRequest, 
  GetTrackedBetsResponse,
  BetTrackerStats 
} from "@/lib/types/bet-tracker";

export class BetTrackerAPI {
  private static instance: BetTrackerAPI;
  private supabase;

  public static getInstance(): BetTrackerAPI {
    if (!BetTrackerAPI.instance) {
      BetTrackerAPI.instance = new BetTrackerAPI();
    }
    return BetTrackerAPI.instance;
  }

  private constructor() {
    this.supabase = createSupabaseClient();
  }

  /**
   * Felhasználó összes tracked bet-jének lekérése
   */
  async getTrackedBets(userId: string): Promise<GetTrackedBetsResponse> {
    try {
      const { data, error, count } = await this.supabase
        .from('bet_tracker')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracked bets:', error);
        throw new Error(`Hiba a fogadások lekérésekor: ${error.message}`);
      }

      return {
        bets: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('BetTrackerAPI.getTrackedBets error:', error);
      throw error;
    }
  }

  /**
   * Új fogadás hozzáadása a tracker-hez
   */
  async addBet(userId: string, betData: AddBetRequest): Promise<BetTrackerItem> {
    try {
      const { data, error } = await this.supabase
        .from('bet_tracker')
        .insert({
          user_id: userId,
          opportunity_id: betData.opportunity_id,
          event_name: betData.event_name,
          sport: betData.sport,
          bookmaker: betData.bookmaker,
          odds: betData.odds,
          stake: betData.stake || null,
          outcome: betData.outcome,
          notes: betData.notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding bet to tracker:', error);
        throw new Error(`Hiba a fogadás hozzáadásakor: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('BetTrackerAPI.addBet error:', error);
      throw error;
    }
  }

  /**
   * Fogadás frissítése
   */
  async updateBet(betId: string, updates: UpdateBetRequest): Promise<BetTrackerItem> {
    try {
      const { data, error } = await this.supabase
        .from('bet_tracker')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', betId)
        .select()
        .single();

      if (error) {
        console.error('Error updating bet:', error);
        throw new Error(`Hiba a fogadás frissítésekor: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('BetTrackerAPI.updateBet error:', error);
      throw error;
    }
  }

  /**
   * Fogadás törlése a tracker-ből
   */
  async removeBet(betId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('bet_tracker')
        .delete()
        .eq('id', betId);

      if (error) {
        console.error('Error removing bet:', error);
        throw new Error(`Hiba a fogadás törlésekor: ${error.message}`);
      }
    } catch (error) {
      console.error('BetTrackerAPI.removeBet error:', error);
      throw error;
    }
  }

  /**
   * Felhasználó összes fogadásának törlése
   */
  async clearAllBets(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('bet_tracker')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing all bets:', error);
        throw new Error(`Hiba az összes fogadás törlésekor: ${error.message}`);
      }
    } catch (error) {
      console.error('BetTrackerAPI.clearAllBets error:', error);
      throw error;
    }
  }

  /**
   * Bet Tracker statisztikák lekérése
   */
  async getBetTrackerStats(userId: string): Promise<BetTrackerStats> {
    try {
      const { data, error } = await this.supabase
        .from('bet_tracker')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching bet tracker stats:', error);
        throw new Error(`Hiba a statisztikák lekérésekor: ${error.message}`);
      }

      const bets = data || [];
      const totalBets = bets.length;
      const pendingBets = bets.filter(bet => bet.status === 'pending').length;
      const wonBets = bets.filter(bet => bet.status === 'won').length;
      const lostBets = bets.filter(bet => bet.status === 'lost').length;
      
      const totalStaked = bets.reduce((sum, bet) => sum + (bet.stake || 0), 0);
      const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      
      const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
      const averageOdds = totalBets > 0 ? bets.reduce((sum, bet) => sum + bet.odds, 0) / totalBets : 0;

      return {
        totalBets,
        pendingBets,
        wonBets,
        lostBets,
        totalStaked,
        totalProfit,
        winRate,
        averageOdds
      };
    } catch (error) {
      console.error('BetTrackerAPI.getBetTrackerStats error:', error);
      throw error;
    }
  }

  /**
   * Real-time subscription a bet tracker változásokhoz
   */
  subscribeToBetTrackerChanges(
    userId: string,
    onUpdate: (payload: any) => void
  ) {
    return this.supabase
      .channel('bet-tracker-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bet_tracker',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe();
  }
}

// Singleton instance export
export const betTrackerAPI = BetTrackerAPI.getInstance();
