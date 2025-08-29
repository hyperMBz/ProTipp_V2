// Unit Tests for Base Bookmaker API Components
// Story 1.1 QA Fixes: Implement Critical Unit Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter, DataTransformer, RateLimitConfig } from '../base';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let config: RateLimitConfig;

  beforeEach(() => {
    config = {
      requests_per_minute: 10,
      requests_per_hour: 100
    };
    rateLimiter = new RateLimiter(config);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('waitForRateLimit', () => {
    it('should allow requests within rate limits', async () => {
      const startTime = Date.now();
      
      // Make 5 requests (under the 10 per minute limit)
      for (let i = 0; i < 5; i++) {
        await rateLimiter.waitForRateLimit();
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be nearly instant
    });

    it('should delay requests when minute limit is exceeded', async () => {
      const startTime = Date.now();
      
      // Make 10 requests to hit the minute limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.waitForRateLimit();
      }
      
      // The 11th request should be delayed
      const delayPromise = rateLimiter.waitForRateLimit();
      
      // Fast forward time to simulate the delay
      vi.advanceTimersByTime(60000); // 1 minute
      
      await delayPromise;
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(60000);
    });

    it('should reset after minute window passes', async () => {
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        await rateLimiter.waitForRateLimit();
      }
      
      // Fast forward past the minute window
      vi.advanceTimersByTime(61000); // Just over 1 minute
      
      // Should be able to make requests again without delay
      const startTime = Date.now();
      await rateLimiter.waitForRateLimit();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle hour limits', async () => {
      // Create a rate limiter with lower limits for testing
      const testRateLimiter = new RateLimiter({
        requests_per_minute: 1000, // High minute limit
        requests_per_hour: 5 // Low hour limit
      });
      
      // Make 5 requests to hit the hour limit
      for (let i = 0; i < 5; i++) {
        await testRateLimiter.waitForRateLimit();
      }
      
      // The 6th request should be delayed
      const delayPromise = testRateLimiter.waitForRateLimit();
      
      // Fast forward time to simulate the delay
      vi.advanceTimersByTime(3600000); // 1 hour
      
      await delayPromise;
    });
  });

  describe('reset', () => {
    it('should clear all request history', async () => {
      // Make some requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.waitForRateLimit();
      }
      
      // Reset
      rateLimiter.reset();
      
      // Should be able to make requests again without delay
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        await rateLimiter.waitForRateLimit();
      }
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

describe('DataTransformer', () => {
  describe('transformOddsData', () => {
    it('should transform complete raw odds data', () => {
      const rawData = {
        id: 'test-id',
        sport: 'football',
        event: 'Team A vs Team B',
        market: 'match_winner',
        outcome: 'Team A',
        odds: '2.5',
        timestamp: '2024-01-01T12:00:00Z',
        is_live: true
      };

      const result = DataTransformer.transformOddsData(rawData);

      expect(result).toEqual({
        id: 'test-id',
        bookmaker_id: '',
        sport: 'football',
        event: 'Team A vs Team B',
        market: 'match_winner',
        outcome: 'Team A',
        odds: 2.5,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        is_live: true
      });
    });

         it('should handle missing optional fields', () => {
       const rawData = {
         sport_key: 'basketball',
         event_name: 'Game',
         market_type: 'winner',
         selection: 'Home',
         odds: 1.5, // Use odds instead of price
         last_update: Date.now()
       };

       const result = DataTransformer.transformOddsData(rawData);

       expect(result.id).toBeDefined();
       expect(result.bookmaker_id).toBe('');
       expect(result.sport).toBe('basketball');
       expect(result.event).toBe('Game');
       expect(result.market).toBe('winner');
       expect(result.outcome).toBe('Home');
       expect(result.odds).toBe(1.5);
       expect(result.timestamp).toBeInstanceOf(Date);
       expect(result.is_live).toBe(false);
     });

    it('should handle numeric odds values', () => {
      const rawData = {
        odds: 3.0,
        sport: 'tennis'
      };

      const result = DataTransformer.transformOddsData(rawData);

      expect(result.odds).toBe(3.0);
      expect(typeof result.odds).toBe('number');
    });

    it('should handle string odds values', () => {
      const rawData = {
        odds: '4.5',
        sport: 'tennis'
      };

      const result = DataTransformer.transformOddsData(rawData);

      expect(result.odds).toBe(4.5);
      expect(typeof result.odds).toBe('number');
    });

    it('should handle live flag variations', () => {
      const rawData1 = { sport: 'football', live: true };
      const rawData2 = { sport: 'football', is_live: false };

      const result1 = DataTransformer.transformOddsData(rawData1);
      const result2 = DataTransformer.transformOddsData(rawData2);

      expect(result1.is_live).toBe(true);
      expect(result2.is_live).toBe(false);
    });
  });

  describe('transformEventData', () => {
         it('should transform event response data', () => {
       const rawData = {
         id: 'event-1',
         name: 'Team A vs Team B',
         sport: 'football',
         start_time: '2024-01-01T15:00:00Z',
         status: 'upcoming' as const,
         markets: [
           { 
             id: 'market-1',
             name: 'match_winner',
             type: 'winner',
             outcomes: []
           },
           { 
             id: 'market-2',
             name: 'total_goals',
             type: 'total',
             outcomes: []
           }
         ]
       };

       const result = DataTransformer.transformEventData(rawData);

       expect(result).toEqual({
         id: 'event-1',
         name: 'Team A vs Team B',
         sport: 'football',
         start_time: new Date('2024-01-01T15:00:00Z'),
         status: 'upcoming',
         markets: ['match_winner', 'total_goals']
       });
     });

         it('should handle events without markets', () => {
       const rawData = {
         id: 'event-2',
         name: 'Game',
         sport: 'basketball',
         start_time: '2024-01-01T16:00:00Z',
         status: 'live' as const
       };

       const result = DataTransformer.transformEventData(rawData);

       expect(result.markets).toEqual([]);
     });
  });

  describe('transformSportsData', () => {
    it('should extract sport names from sport objects', () => {
      const rawData = [
        { id: '1', name: 'Football', active: true },
        { id: '2', name: 'Basketball', active: true },
        { id: '3', name: 'Tennis', active: false }
      ];

      const result = DataTransformer.transformSportsData(rawData);

      expect(result).toEqual(['Football', 'Basketball', 'Tennis']);
    });

    it('should handle empty sports array', () => {
      const result = DataTransformer.transformSportsData([]);
      expect(result).toEqual([]);
    });
  });
});


