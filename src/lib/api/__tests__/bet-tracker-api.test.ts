import { BetTrackerAPI } from '../bet-tracker-api';
import { supabase } from '@/lib/supabase/client';
import { BetTrackerItem, AddBetRequest } from '@/lib/types/bet-tracker';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
            count: 0
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

describe('BetTrackerAPI', () => {
  let api: BetTrackerAPI;

  beforeEach(() => {
    api = BetTrackerAPI.getInstance();
    jest.clearAllMocks();
  });

  describe('getTrackedBets', () => {
    it('should fetch tracked bets successfully', async () => {
      const mockBets: BetTrackerItem[] = [
        {
          id: 'bet-1',
          user_id: 'user-1',
          opportunity_id: 'opp-1',
          event_name: 'Test Match',
          sport: 'Football',
          bookmaker: 'TestBookmaker',
          odds: 2.5,
          stake: 100,
          outcome: 'Home Win',
          status: 'pending',
          added_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockBets,
              error: null,
              count: 1
            })
          })
        })
      });

      const result = await api.getTrackedBets('user-1');

      expect(result.bets).toEqual(mockBets);
      expect(result.total).toBe(1);
      expect(supabase.from).toHaveBeenCalledWith('bet_tracker');
    });

    it('should handle errors when fetching tracked bets', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
              count: 0
            })
          })
        })
      });

      await expect(api.getTrackedBets('user-1')).rejects.toThrow('Hiba a fogadások lekérésekor: Database error');
    });
  });

  describe('addBet', () => {
    it('should add bet successfully', async () => {
      const mockBet: BetTrackerItem = {
        id: 'bet-1',
        user_id: 'user-1',
        opportunity_id: 'opp-1',
        event_name: 'Test Match',
        sport: 'Football',
        bookmaker: 'TestBookmaker',
        odds: 2.5,
        stake: 100,
        outcome: 'Home Win',
        status: 'pending',
        added_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const addRequest: AddBetRequest = {
        opportunity_id: 'opp-1',
        event_name: 'Test Match',
        sport: 'Football',
        bookmaker: 'TestBookmaker',
        odds: 2.5,
        stake: 100,
        outcome: 'Home Win'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBet,
              error: null
            })
          })
        })
      });

      const result = await api.addBet('user-1', addRequest);

      expect(result).toEqual(mockBet);
      expect(supabase.from).toHaveBeenCalledWith('bet_tracker');
    });

    it('should handle errors when adding bet', async () => {
      const addRequest: AddBetRequest = {
        opportunity_id: 'opp-1',
        event_name: 'Test Match',
        sport: 'Football',
        bookmaker: 'TestBookmaker',
        odds: 2.5,
        outcome: 'Home Win'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert error' }
            })
          })
        })
      });

      await expect(api.addBet('user-1', addRequest)).rejects.toThrow('Hiba a fogadás hozzáadásakor: Insert error');
    });
  });

  describe('updateBet', () => {
    it('should update bet successfully', async () => {
      const mockBet: BetTrackerItem = {
        id: 'bet-1',
        user_id: 'user-1',
        opportunity_id: 'opp-1',
        event_name: 'Test Match',
        sport: 'Football',
        bookmaker: 'TestBookmaker',
        odds: 2.5,
        stake: 150,
        outcome: 'Home Win',
        status: 'won',
        added_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockBet,
                error: null
              })
            })
          })
        })
      });

      const result = await api.updateBet('bet-1', { stake: 150, status: 'won' });

      expect(result).toEqual(mockBet);
      expect(supabase.from).toHaveBeenCalledWith('bet_tracker');
    });

    it('should handle errors when updating bet', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update error' }
              })
            })
          })
        })
      });

      await expect(api.updateBet('bet-1', { stake: 150 })).rejects.toThrow('Hiba a fogadás frissítésekor: Update error');
    });
  });

  describe('removeBet', () => {
    it('should remove bet successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      await expect(api.removeBet('bet-1')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('bet_tracker');
    });

    it('should handle errors when removing bet', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete error' }
          })
        })
      });

      await expect(api.removeBet('bet-1')).rejects.toThrow('Hiba a fogadás törlésekor: Delete error');
    });
  });

  describe('getStats', () => {
    it('should calculate stats correctly', async () => {
      const mockBets: BetTrackerItem[] = [
        {
          id: 'bet-1',
          user_id: 'user-1',
          opportunity_id: 'opp-1',
          event_name: 'Test Match 1',
          sport: 'Football',
          bookmaker: 'TestBookmaker',
          odds: 2.5,
          stake: 100,
          outcome: 'Home Win',
          status: 'won',
          profit: 150,
          added_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'bet-2',
          user_id: 'user-1',
          opportunity_id: 'opp-2',
          event_name: 'Test Match 2',
          sport: 'Basketball',
          bookmaker: 'TestBookmaker2',
          odds: 1.8,
          stake: 50,
          outcome: 'Away Win',
          status: 'lost',
          profit: -50,
          added_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockBets,
            error: null
          })
        })
      });

      const stats = await api.getStats('user-1');

      expect(stats.totalBets).toBe(2);
      expect(stats.wonBets).toBe(1);
      expect(stats.lostBets).toBe(1);
      expect(stats.totalStaked).toBe(150);
      expect(stats.totalProfit).toBe(100);
      expect(stats.winRate).toBe(50);
    });
  });
});
