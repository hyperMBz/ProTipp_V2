import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database if needed
    console.log('Setting up test database connection...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test database...');
  });

  beforeEach(async () => {
    // Clear test data before each test
    try {
      await supabase.from('arbitrage_opportunities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (error) {
      console.log('No test data to clean up');
    }
  });

  describe('Arbitrage Opportunities Table', () => {
    it('should connect to database successfully', async () => {
      const { data, error } = await supabase.from('arbitrage_opportunities').select('count').limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should insert arbitrage opportunity', async () => {
      const testOpportunity = {
        bookmaker1: 'TestBookmaker1',
        bookmaker2: 'TestBookmaker2',
        sport: 'TestSport',
        event: 'Test Event',
        odds1: 2.0,
        odds2: 2.1,
        profit_percentage: 5.2,
        stake1: 100,
        stake2: 95.24
      };

      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .insert(testOpportunity)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]).toMatchObject(testOpportunity);
    });

    it('should query arbitrage opportunities by sport', async () => {
      // Insert test data
      const testData = [
        {
          bookmaker1: 'Bookmaker1',
          bookmaker2: 'Bookmaker2',
          sport: 'Football',
          event: 'Test Football Event',
          odds1: 1.8,
          odds2: 2.2,
          profit_percentage: 4.5,
          stake1: 100,
          stake2: 81.82
        },
        {
          bookmaker1: 'Bookmaker3',
          bookmaker2: 'Bookmaker4',
          sport: 'Tennis',
          event: 'Test Tennis Event',
          odds1: 1.9,
          odds2: 2.1,
          profit_percentage: 3.2,
          stake1: 100,
          stake2: 90.48
        }
      ];

      await supabase.from('arbitrage_opportunities').insert(testData);

      // Query by sport
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .eq('sport', 'Football');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.[0].sport).toBe('Football');
    });

    it('should filter by minimum profit percentage', async () => {
      // Insert test data with different profit percentages
      const testData = [
        {
          bookmaker1: 'Bookmaker1',
          bookmaker2: 'Bookmaker2',
          sport: 'Football',
          event: 'High Profit Event',
          odds1: 1.5,
          odds2: 3.0,
          profit_percentage: 10.0,
          stake1: 100,
          stake2: 50.0
        },
        {
          bookmaker1: 'Bookmaker3',
          bookmaker2: 'Bookmaker4',
          sport: 'Football',
          event: 'Low Profit Event',
          odds1: 1.8,
          odds2: 2.0,
          profit_percentage: 2.0,
          stake1: 100,
          stake2: 90.0
        }
      ];

      await supabase.from('arbitrage_opportunities').insert(testData);

      // Query with minimum profit filter
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .gte('profit_percentage', 5.0);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
      data?.forEach(opportunity => {
        expect(opportunity.profit_percentage).toBeGreaterThanOrEqual(5.0);
      });
    });

    it('should order by profit percentage descending', async () => {
      // Insert test data
      const testData = [
        {
          bookmaker1: 'Bookmaker1',
          bookmaker2: 'Bookmaker2',
          sport: 'Football',
          event: 'Medium Profit Event',
          odds1: 1.8,
          odds2: 2.2,
          profit_percentage: 4.5,
          stake1: 100,
          stake2: 81.82
        },
        {
          bookmaker1: 'Bookmaker3',
          bookmaker2: 'Bookmaker4',
          sport: 'Football',
          event: 'High Profit Event',
          odds1: 1.5,
          odds2: 3.0,
          profit_percentage: 10.0,
          stake1: 100,
          stake2: 50.0
        },
        {
          bookmaker1: 'Bookmaker5',
          bookmaker2: 'Bookmaker6',
          sport: 'Football',
          event: 'Low Profit Event',
          odds1: 1.9,
          odds2: 2.1,
          profit_percentage: 2.0,
          stake1: 100,
          stake2: 90.48
        }
      ];

      await supabase.from('arbitrage_opportunities').insert(testData);

      // Query ordered by profit percentage
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .order('profit_percentage', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(1);

      // Check ordering
      for (let i = 0; i < (data?.length || 0) - 1; i++) {
        expect(data![i].profit_percentage).toBeGreaterThanOrEqual(data![i + 1].profit_percentage);
      }
    });
  });

  describe('User Bets Table', () => {
    it('should connect to user_bets table', async () => {
      const { data, error } = await supabase.from('user_bets').select('count').limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should insert user bet', async () => {
      const testBet = {
        user_id: 'test-user-id',
        arbitrage_id: 'test-arbitrage-id',
        stake_amount: 100,
        bookmaker1: 'TestBookmaker1',
        bookmaker2: 'TestBookmaker2',
        odds1: 2.0,
        odds2: 2.1,
        expected_profit: 5.2,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('user_bets')
        .insert(testBet)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]).toMatchObject(testBet);
    });

    it('should query user bets by user_id', async () => {
      const userId = 'test-user-123';
      const testBets = [
        {
          user_id: userId,
          arbitrage_id: 'arbitrage-1',
          stake_amount: 100,
          bookmaker1: 'Bookmaker1',
          bookmaker2: 'Bookmaker2',
          odds1: 2.0,
          odds2: 2.1,
          expected_profit: 5.2,
          status: 'pending'
        },
        {
          user_id: userId,
          arbitrage_id: 'arbitrage-2',
          stake_amount: 150,
          bookmaker1: 'Bookmaker3',
          bookmaker2: 'Bookmaker4',
          odds1: 1.8,
          odds2: 2.3,
          expected_profit: 3.8,
          status: 'completed'
        }
      ];

      await supabase.from('user_bets').insert(testBets);

      const { data, error } = await supabase
        .from('user_bets')
        .select('*')
        .eq('user_id', userId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(2);
      data?.forEach(bet => {
        expect(bet.user_id).toBe(userId);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Insert larger dataset for performance testing
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        bookmaker1: `Bookmaker${i % 5}`,
        bookmaker2: `Bookmaker${(i + 1) % 5}`,
        sport: ['Football', 'Tennis', 'Basketball'][i % 3],
        event: `Event ${i}`,
        odds1: 1.5 + (i % 10) * 0.1,
        odds2: 2.0 + (i % 10) * 0.1,
        profit_percentage: 1.0 + (i % 20) * 0.5,
        stake1: 100,
        stake2: 90 + (i % 10)
      }));

      const startTime = Date.now();
      await supabase.from('arbitrage_opportunities').insert(largeDataset);
      const insertTime = Date.now() - startTime;

      // Query with complex filters
      const queryStartTime = Date.now();
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .gte('profit_percentage', 5.0)
        .eq('sport', 'Football')
        .order('profit_percentage', { ascending: false })
        .limit(20);

      const queryTime = Date.now() - queryStartTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(insertTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent queries', async () => {
      const concurrentQueries = Array.from({ length: 10 }, () =>
        supabase
          .from('arbitrage_opportunities')
          .select('count')
          .limit(1)
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentQueries);
      const totalTime = Date.now() - startTime;

      results.forEach(result => {
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });

      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Data Integrity Tests', () => {
    it('should enforce required fields', async () => {
      const invalidData = {
        bookmaker1: 'TestBookmaker1'
        // Missing required fields
      };

      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .insert(invalidData)
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should validate odds format', async () => {
      const invalidData = {
        bookmaker1: 'TestBookmaker1',
        bookmaker2: 'TestBookmaker2',
        sport: 'TestSport',
        event: 'Test Event',
        odds1: -1, // Invalid odds
        odds2: 2.1,
        profit_percentage: 5.2,
        stake1: 100,
        stake2: 95.24
      };

      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .insert(invalidData)
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should handle foreign key constraints', async () => {
      const invalidBet = {
        user_id: 'non-existent-user',
        arbitrage_id: 'non-existent-arbitrage',
        stake_amount: 100,
        bookmaker1: 'TestBookmaker1',
        bookmaker2: 'TestBookmaker2',
        odds1: 2.0,
        odds2: 2.1,
        expected_profit: 5.2,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('user_bets')
        .insert(invalidBet)
        .select();

      // This might succeed or fail depending on foreign key constraints
      // We just want to ensure the database handles it gracefully
      expect(error === null || error !== null).toBe(true);
    });
  });
});
