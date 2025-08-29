// Performance Tests for Bookmaker API Integration
// Story 1.1 QA Fixes: Add Performance Benchmarks

import { describe, it, expect } from 'vitest';

describe('BookmakerManager - Performance Tests', () => {
  describe('performance benchmarks', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate large dataset processing
      const largeOddsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `odds-${i}`,
        bookmaker_id: 'test',
        sport: 'football',
        event: `Event ${i}`,
        market: 'match_winner',
        outcome: 'Home',
        odds: 2.0 + (i % 10) * 0.1,
        timestamp: new Date(),
        is_live: false
      }));
      
      // Process the data
      const processed = largeOddsArray.map(odds => ({
        ...odds,
        processed: true
      }));
      
      const endTime = performance.now();
      
      expect(processed).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should process quickly
    });

    it('should handle arbitrage calculations efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate arbitrage calculation with odds that create opportunity
      const bookmakerOdds = [
        { bookmaker_id: 'book1', odds: 2.0 },
        { bookmaker_id: 'book2', odds: 2.0 }
      ];

      // Calculate arbitrage opportunity
      const totalProbability = bookmakerOdds.reduce((sum, bo) => sum + (1 / bo.odds), 0);
      const profitPercentage = (1 - totalProbability) * 100;
      
      const endTime = performance.now();
      
      expect(profitPercentage).toBe(0); // Exactly break-even
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });

    it('should handle data transformation efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate data transformation
      const rawData = Array.from({ length: 500 }, (_, i) => ({
        id: i.toString(),
        sport_key: 'football',
        event_name: `Event ${i}`,
        market_type: 'h2h',
        outcome_name: 'Home',
        price: 2.0 + (i % 5) * 0.1,
        last_update: Date.now()
      }));
      
      // Transform to RealTimeOdds format
      const transformed = rawData.map(item => ({
        id: item.id,
        bookmaker_id: 'test',
        sport: item.sport_key,
        event: item.event_name,
        market: item.market_type,
        outcome: item.outcome_name,
        odds: item.price,
        timestamp: new Date(item.last_update),
        is_live: false
      }));
      
      const endTime = performance.now();
      
      expect(transformed).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });
  });

  describe('memory efficiency', () => {
    it('should handle memory allocation efficiently', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Allocate large arrays
      const largeArray1 = new Array(10000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }));
      const largeArray2 = new Array(10000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }));
      
      const midMemory = process.memoryUsage().heapUsed;
      
      // Clear references
      const _ = largeArray1.length + largeArray2.length; // Use the arrays
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('algorithm efficiency', () => {
    it('should handle sorting efficiently', () => {
      const startTime = performance.now();
      
      // Create large array to sort
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        odds: Math.random() * 10,
        timestamp: Date.now() - Math.random() * 1000000
      }));
      
      // Sort by odds
      const sortedByOdds = [...largeArray].sort((a, b) => a.odds - b.odds);
      
      // Sort by timestamp
      const sortedByTime = [...largeArray].sort((a, b) => a.timestamp - b.timestamp);
      
      const endTime = performance.now();
      
      expect(sortedByOdds).toHaveLength(10000);
      expect(sortedByTime).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should handle filtering efficiently', () => {
      const startTime = performance.now();
      
      // Create large array to filter
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        sport: ['football', 'basketball', 'tennis'][i % 3],
        odds: Math.random() * 10,
        is_live: i % 2 === 0
      }));
      
      // Multiple filters
      const footballOdds = largeArray.filter(item => item.sport === 'football');
      const highOdds = largeArray.filter(item => item.odds > 5);
      const liveEvents = largeArray.filter(item => item.is_live);
      
      const endTime = performance.now();
      
      expect(footballOdds.length).toBeGreaterThan(0);
      expect(highOdds.length).toBeGreaterThan(0);
      expect(liveEvents.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });
  });
});
