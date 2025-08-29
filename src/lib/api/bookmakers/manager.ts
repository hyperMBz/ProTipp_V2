// Bookmaker Manager Service
// Story 1.1 Task 3: Create Bookmaker Manager Service

import { 
  BookmakerAPI, 
  DisconnectableBookmakerAPI,
  RealTimeOdds, 
  BookmakerEvent, 
  BookmakerIntegration,
  DataTransformer
} from './base';
import { createBet365API, Bet365API } from './bet365';
import { createPinnacleAPI, PinnacleAPI } from './pinnacle';
import { createWilliamHillAPI, WilliamHillAPI } from './williamhill';

interface BookmakerInstance {
  api: BookmakerAPI;
  status: BookmakerIntegration;
  lastHealthCheck: Date;
  isHealthy: boolean;
}

export interface AggregatedOdds {
  event_id: string;
  sport: string;
  market: string;
  outcome: string;
  bookmaker_odds: Array<{
    bookmaker_id: string;
    odds: number;
    timestamp: Date;
  }>;
  best_odds: number;
  best_bookmaker: string;
  arbitrage_opportunity?: {
    profit_percentage: number;
    recommended_stakes: Array<{
      bookmaker_id: string;
      stake: number;
    }>;
  };
}

export interface BookmakerManagerConfig {
  healthCheckInterval: number;
  maxReconnectAttempts: number;
  fallbackEnabled: boolean;
}

export class BookmakerManager {
  private bookmakers: Map<string, BookmakerInstance> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private fallbackOddsAPI: {
    getOddsData: (sport?: string) => Promise<Array<{
      id?: string;
      sport_key?: string;
      event_name?: string;
      market_type?: string;
      outcome_name?: string;
      price?: number;
      last_update?: string | number;
    }>>;
  } | null = null; // Existing The Odds API integration
  private config: BookmakerManagerConfig;

  constructor(config: BookmakerManagerConfig = {
    healthCheckInterval: 5 * 60 * 1000, // 5 minutes
    maxReconnectAttempts: 3,
    fallbackEnabled: true
  }) {
    this.config = config;
    this.initializeBookmakers();
  }

  private initializeBookmakers(): void {
    // Initialize supported bookmakers
    const bet365 = createBet365API();
    const pinnacle = createPinnacleAPI();
    const williamhill = createWilliamHillAPI();

    this.bookmakers.set('bet365', {
      api: bet365,
      status: bet365.getStatus(),
      lastHealthCheck: new Date(),
      isHealthy: false
    });

    this.bookmakers.set('pinnacle', {
      api: pinnacle,
      status: pinnacle.getStatus(),
      lastHealthCheck: new Date(),
      isHealthy: false
    });

    this.bookmakers.set('williamhill', {
      api: williamhill,
      status: williamhill.getStatus(),
      lastHealthCheck: new Date(),
      isHealthy: false
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log('info', 'Initializing Bookmaker Manager...');

    // Initialize all bookmakers with timeout
    const initPromises = Array.from(this.bookmakers.values()).map(async (instance) => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Initialization timeout')), 10000);
        });

        const initPromise = instance.api.initialize();
        
        await Promise.race([initPromise, timeoutPromise]);
        
        instance.isHealthy = true;
        instance.status.status = 'active';
        this.log('info', `${instance.api.name} initialized successfully`);
      } catch (error) {
        instance.isHealthy = false;
        instance.status.status = 'error';
        this.log('error', `Failed to initialize ${instance.api.name}:`, error as Error);
      }
    });

    await Promise.allSettled(initPromises);

    // Start health monitoring
    this.startHealthMonitoring();

    this.isInitialized = true;
    this.log('info', 'Bookmaker Manager initialized successfully');
  }

  async getOdds(sport?: string, event?: string, useCache: boolean = true): Promise<RealTimeOdds[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const allOdds: RealTimeOdds[] = [];
    const healthyBookmakers = Array.from(this.bookmakers.values())
      .filter(instance => instance.isHealthy);

    if (healthyBookmakers.length === 0) {
      this.log('warn', 'No healthy bookmakers available, using fallback API');
      return this.getFallbackOdds(sport, event);
    }

    // Get odds from all healthy bookmakers
    const oddsPromises = healthyBookmakers.map(async (instance) => {
      try {
        const odds = await instance.api.getOdds(sport, event);
        odds.forEach(oddsData => {
          oddsData.bookmaker_id = instance.api.bookmaker_id;
        });
        return odds;
      } catch (error) {
        this.log('error', `Failed to get odds from ${instance.api.name}:`, error as Error);
        instance.isHealthy = false;
        instance.status.status = 'error';
        return [];
      }
    });

    const results = await Promise.allSettled(oddsPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allOdds.push(...result.value);
      }
    });

    // Update last sync time for successful bookmakers
    healthyBookmakers.forEach(instance => {
      instance.status.last_sync = new Date();
    });

    if (allOdds.length === 0) {
      this.log('warn', 'No odds received from any bookmaker, using fallback');
      return this.getFallbackOdds(sport, event);
    }

    return allOdds;
  }

  async getAggregatedOdds(sport?: string, event?: string): Promise<AggregatedOdds[]> {
    const odds = await this.getOdds(sport, event);
    const aggregated: Map<string, AggregatedOdds> = new Map();

    odds.forEach(oddsData => {
      const key = `${oddsData.event}_${oddsData.market}_${oddsData.outcome}`;
      
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          event_id: oddsData.event,
          sport: oddsData.sport,
          market: oddsData.market,
          outcome: oddsData.outcome,
          bookmaker_odds: [],
          best_odds: 0,
          best_bookmaker: ''
        });
      }

      const agg = aggregated.get(key)!;
      agg.bookmaker_odds.push({
        bookmaker_id: oddsData.bookmaker_id,
        odds: oddsData.odds,
        timestamp: oddsData.timestamp
      });

      if (oddsData.odds > agg.best_odds) {
        agg.best_odds = oddsData.odds;
        agg.best_bookmaker = oddsData.bookmaker_id;
      }
    });

    // Calculate arbitrage opportunities
    Array.from(aggregated.values()).forEach(agg => {
      if (agg.bookmaker_odds.length >= 2) {
        const arbitrage = this.calculateArbitrage(agg.bookmaker_odds);
        if (arbitrage.profit_percentage > 0) {
          agg.arbitrage_opportunity = arbitrage;
        }
      }
    });

    return Array.from(aggregated.values());
  }

  private calculateArbitrage(bookmakerOdds: Array<{ bookmaker_id: string; odds: number }>): {
    profit_percentage: number;
    recommended_stakes: Array<{ bookmaker_id: string; stake: number }>;
  } {
    // Calculate implied probabilities
    const probabilities = bookmakerOdds.map(bo => ({
      bookmaker_id: bo.bookmaker_id,
      probability: 1 / bo.odds
    }));

    const totalProbability = probabilities.reduce((sum, p) => sum + p.probability, 0);
    const profitPercentage = (1 - totalProbability) * 100;

    if (profitPercentage <= 0) {
      return {
        profit_percentage: 0,
        recommended_stakes: []
      };
    }

    // Calculate optimal stakes for $100 total bet
    const totalStake = 100;
    const recommendedStakes = probabilities.map(p => ({
      bookmaker_id: p.bookmaker_id,
      stake: (p.probability / totalProbability) * totalStake
    }));

    return {
      profit_percentage: profitPercentage,
      recommended_stakes: recommendedStakes
    };
  }

  async getEvents(sport?: string): Promise<BookmakerEvent[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const allEvents: BookmakerEvent[] = [];
    const healthyBookmakers = Array.from(this.bookmakers.values())
      .filter(instance => instance.isHealthy);

    if (healthyBookmakers.length === 0) {
      this.log('warn', 'No healthy bookmakers available for events');
      return [];
    }

    const eventPromises = healthyBookmakers.map(async (instance) => {
      try {
        return await instance.api.getEvents(sport);
      } catch (error) {
        this.log('error', `Failed to get events from ${instance.api.name}:`, error as Error);
        return [];
      }
    });

    const results = await Promise.allSettled(eventPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allEvents.push(...result.value);
      }
    });

    // Remove duplicates based on event ID
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );

    return uniqueEvents;
  }

  async getSports(): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const allSports: string[] = [];
    const healthyBookmakers = Array.from(this.bookmakers.values())
      .filter(instance => instance.isHealthy);

    if (healthyBookmakers.length === 0) {
      this.log('warn', 'No healthy bookmakers available for sports');
      return [];
    }

    const sportsPromises = healthyBookmakers.map(async (instance) => {
      try {
        return await instance.api.getSports();
      } catch (error) {
        this.log('error', `Failed to get sports from ${instance.api.name}:`, error as Error);
        return [];
      }
    });

    const results = await Promise.allSettled(sportsPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allSports.push(...result.value);
      }
    });

    // Remove duplicates
    return [...new Set(allSports)];
  }

  async getBookmakerStatus(): Promise<BookmakerIntegration[]> {
    return Array.from(this.bookmakers.values()).map(instance => instance.api.getStatus());
  }

  async checkBookmakerHealth(bookmakerId: string): Promise<boolean> {
    const instance = this.bookmakers.get(bookmakerId);
    if (!instance) {
      return false;
    }

    try {
      const isHealthy = await instance.api.checkHealth();
      instance.isHealthy = isHealthy;
      instance.lastHealthCheck = new Date();
      instance.status = instance.api.getStatus();
      
      this.log('info', `${instance.api.name} health check: ${isHealthy ? 'PASS' : 'FAIL'}`);
      return isHealthy;
    } catch (error) {
      instance.isHealthy = false;
      instance.status.status = 'error';
      this.log('error', `${instance.api.name} health check failed:`, error as Error);
      return false;
    }
  }

  async checkAllHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const bookmakerId of this.bookmakers.keys()) {
      results[bookmakerId] = await this.checkBookmakerHealth(bookmakerId);
    }
    
    return results;
  }

  getCacheStats(): { totalBookmakers: number; healthyBookmakers: number; errorBookmakers: number } {
    const total = this.bookmakers.size;
    const healthy = Array.from(this.bookmakers.values()).filter(instance => instance.isHealthy).length;
    const errors = total - healthy;
    
    return {
      totalBookmakers: total,
      healthyBookmakers: healthy,
      errorBookmakers: errors
    };
  }

  clearCache(): void {
    // Clear any cached data
    this.log('info', 'Cache cleared');
  }

  addBookmaker(id: string, bookmaker: BookmakerAPI): void {
    this.bookmakers.set(id, {
      api: bookmaker,
      status: bookmaker.getStatus(),
      lastHealthCheck: new Date(),
      isHealthy: false
    });
    this.log('info', `Added bookmaker: ${bookmaker.name}`);
  }

  removeBookmaker(bookmakerId: string): boolean {
    const instance = this.bookmakers.get(bookmakerId);
    if (instance) {
      if ('disconnect' in instance.api) {
        (instance.api as DisconnectableBookmakerAPI).disconnect();
      }
      this.bookmakers.delete(bookmakerId);
      this.log('info', `Removed bookmaker: ${instance.api.name}`);
      return true;
    }
    return false;
  }

  private async getFallbackOdds(sport?: string, event?: string): Promise<RealTimeOdds[]> {
    try {
      // Import existing odds API dynamically to avoid circular dependencies
      const { oddsApiClient } = await import('../odds-api');
      const fallbackOdds = await oddsApiClient.getOdds(sport || 'soccer_epl');
      
      // Transform to RealTimeOdds format
      return fallbackOdds.flatMap((event: { 
        sport_key?: string; 
        away_team: string; 
        home_team: string; 
        bookmakers: Array<{
          key: string;
          last_update?: string;
          markets: Array<{
            key: string;
            outcomes: Array<{
              name: string;
              price?: number;
            }>;
          }>;
        }>;
      }) => 
        event.bookmakers.flatMap((bookmaker) =>
          bookmaker.markets.flatMap((market) =>
            market.outcomes.map((outcome) => ({
              id: crypto.randomUUID(),
              bookmaker_id: bookmaker.key,
              sport: event.sport_key || '',
              event: `${event.away_team} vs ${event.home_team}`,
              market: market.key,
              outcome: outcome.name,
              odds: outcome.price || 0,
              timestamp: new Date(bookmaker.last_update || Date.now()),
              is_live: false
            }))
          )
        )
      );
    } catch (error) {
      this.log('error', 'Fallback odds API also failed:', error as Error);
      return [];
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      this.log('debug', 'Running health check on all bookmakers...');
      
      const healthPromises = Array.from(this.bookmakers.keys()).map(bookmakerId =>
        this.checkBookmakerHealth(bookmakerId)
      );

      await Promise.allSettled(healthPromises);
    }, this.config.healthCheckInterval);
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, error?: Error): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[BookmakerManager] ${timestamp} ${level.toUpperCase()}: ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage, error);
        break;
    }
  }

  async shutdown(): Promise<void> {
    this.log('info', 'Shutting down Bookmaker Manager...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Disconnect WebSocket connections
    for (const instance of this.bookmakers.values()) {
      if ('disconnect' in instance.api) {
        (instance.api as DisconnectableBookmakerAPI).disconnect();
      }
    }

    this.isInitialized = false;
    this.log('info', 'Bookmaker Manager shutdown complete');
  }

  // Get specific bookmaker instance
  getBookmaker(bookmakerId: string): BookmakerAPI | null {
    const instance = this.bookmakers.get(bookmakerId);
    return instance ? instance.api : null;
  }

  // Get all bookmaker IDs
  getBookmakerIds(): string[] {
    return Array.from(this.bookmakers.keys());
  }

  // Check if a bookmaker is healthy
  isBookmakerHealthy(bookmakerId: string): boolean {
    const instance = this.bookmakers.get(bookmakerId);
    return instance ? instance.isHealthy : false;
  }
}

// Singleton instance
let bookmakerManagerInstance: BookmakerManager | null = null;

export function getBookmakerManager(): BookmakerManager {
  if (!bookmakerManagerInstance) {
    bookmakerManagerInstance = new BookmakerManager();
  }
  return bookmakerManagerInstance;
}

export async function initializeBookmakerManager(): Promise<BookmakerManager> {
  const manager = getBookmakerManager();
  await manager.initialize();
  return manager;
}

export function resetBookmakerManager(): void {
  if (bookmakerManagerInstance) {
    bookmakerManagerInstance.shutdown();
    bookmakerManagerInstance = null;
  }
}
