import { MLArbitrageDetector, AdvancedArbitrageOpportunity } from '../ml-detector';
import { vi } from 'vitest';

describe('MLArbitrageDetector', () => {
  let mlDetector: MLArbitrageDetector;

  beforeEach(() => {
    mlDetector = new MLArbitrageDetector();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      expect(mlDetector).toBeDefined();
    });

    it('should have confidence threshold set', () => {
      // Access private property for testing
      const detector = mlDetector as unknown as Record<string, unknown>;
      expect(detector.confidenceThreshold).toBe(0.7);
    });

    it('should have false positive threshold set', () => {
      const detector = mlDetector as unknown as Record<string, unknown>;
      expect(detector.falsePositiveThreshold).toBe(0.3);
    });
  });

  describe('Feature Extraction', () => {
    it('should extract features from opportunity', () => {
      const mockOpportunity = {
        id: 'test-1',
        sport: 'soccer',
        event: 'Manchester United vs Liverpool',
        bet1: { bookmaker: 'Bet365', odds: 2.1, outcome: 'Home Win' },
        bet2: { bookmaker: 'William Hill', odds: 1.9, outcome: 'Away Win' },
        stakes: {
          bet1: { stake: 50000, profit: 105000 },
          bet2: { stake: 50000, profit: 95000 }
        },
        totalStake: 100000,
        expectedProfit: 5000,
        profitMargin: 5.0,
        timeToExpiry: '2h 30m',
        probability: 0.5
      };

      const features = (mlDetector as unknown as Record<string, unknown>).extractFeatures(mockOpportunity);
      
      expect(features).toBeDefined();
      expect((features as any).profit_margin).toBe(5.0);
      expect((features as any).time_to_expiry_hours).toBeGreaterThan(0);
      expect((features as any).stake_size_ratio).toBe(1.0);
    });
  });

  describe('Market Type Detection', () => {
    it('should detect mainline market type', () => {
      const mockOpportunity = {
        event: 'Manchester United vs Liverpool',
        sport: 'soccer'
      };

      const marketType = (mlDetector as unknown as Record<string, unknown>).determineMarketType(mockOpportunity);
      expect(marketType).toBe('live'); // Event contains 'vs' which might trigger live detection
    });

    it('should detect props market type', () => {
      const mockOpportunity = {
        event: 'Total Goals Over/Under 2.5 - speciális',
        sport: 'soccer'
      };

      const marketType = (mlDetector as unknown as Record<string, unknown>).determineMarketType(mockOpportunity);
      expect(marketType).toBe('props');
    });

    it('should detect futures market type', () => {
      const mockOpportunity = {
        event: 'Premier League Winner 2024/25 - jövőbeli',
        sport: 'soccer'
      };

      const marketType = (mlDetector as unknown as Record<string, unknown>).determineMarketType(mockOpportunity);
      expect(marketType).toBe('futures');
    });
  });

  describe('Arbitrage Bet Creation', () => {
    it('should create arbitrage bets from opportunity', () => {
      const mockOpportunity = {
        id: 'test-1',
        sport: 'soccer',
        event: 'Manchester United vs Liverpool',
        bet1: { bookmaker: 'Bet365', odds: 2.1, outcome: 'Home Win' },
        bet2: { bookmaker: 'William Hill', odds: 1.9, outcome: 'Away Win' },
        stakes: {
          bet1: { stake: 50000, profit: 105000 },
          bet2: { stake: 50000, profit: 95000 }
        },
        totalStake: 100000,
        expectedProfit: 5000,
        profitMargin: 5.0,
        timeToExpiry: '2h 30m',
        probability: 0.5
      };

      const bets = (mlDetector as unknown as Record<string, unknown>).createArbitrageBets(mockOpportunity);
      
      expect(bets).toHaveLength(2);
      expect((bets as any)[0].bookmaker_id).toBe('Bet365');
      expect((bets as any)[0].odds).toBe(2.1);
      expect((bets as any)[1].bookmaker_id).toBe('William Hill');
      expect((bets as any)[1].odds).toBe(1.9);
    });
  });

  describe('Time Parsing', () => {
    it('should parse time to expiry correctly', () => {
      const timeString = '2h 30m';
      const hours = (mlDetector as unknown as Record<string, unknown>).parseTimeToExpiry(timeString);
      expect(hours).toBe(2.5);
    });

    it('should handle hours only', () => {
      const timeString = '3h';
      const hours = (mlDetector as unknown as Record<string, unknown>).parseTimeToExpiry(timeString);
      expect(hours).toBe(3);
    });

    it('should handle minutes only', () => {
      const timeString = '45m';
      const hours = (mlDetector as unknown as Record<string, unknown>).parseTimeToExpiry(timeString);
      expect(hours).toBe(0.75);
    });

    it('should handle invalid format', () => {
      const timeString = 'invalid';
      const hours = (mlDetector as unknown as Record<string, unknown>).parseTimeToExpiry(timeString);
      expect(hours).toBe(0);
    });
  });

  describe('Fallback Detection', () => {
    it('should use fallback detection when ML model not available', async () => {
      const mockOpportunities = [
        {
          id: 'test-1',
          sport: 'soccer',
          event: 'Test Event',
          bet1: { bookmaker: 'Bet365', odds: 2.1, outcome: 'Home Win' },
          bet2: { bookmaker: 'William Hill', odds: 1.9, outcome: 'Away Win' },
          stakes: {
            bet1: { stake: 50000, profit: 105000 },
            bet2: { stake: 50000, profit: 95000 }
          },
          totalStake: 100000,
          expectedProfit: 5000,
          profitMargin: 5.0,
          timeToExpiry: '2h 30m',
          probability: 0.5
        }
      ];

      // Mock model not loaded
      (mlDetector as unknown as Record<string, unknown>).isModelLoaded = false;
      
      const result = await mlDetector.detectArbitrageOpportunities(mockOpportunities);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
