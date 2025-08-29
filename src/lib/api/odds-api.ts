import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getBookmakerManager } from './bookmakers/manager';
import { RealTimeOdds } from './bookmakers/base';

// The Odds API Response Types
export interface OddsApiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiMarket {
  key: string; // 'h2h', 'spreads', 'totals'
  last_update: string;
  outcomes: OddsApiOutcome[];
}

export interface OddsApiOutcome {
  name: string;
  price: number; // This is the odds
  point?: number; // For spreads/totals
}

export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

// Our internal types for arbitrage calculation
export interface ProcessedOddsData {
  eventId: string;
  sport: string;
  event: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  markets: ProcessedMarket[];
}

export interface ProcessedMarket {
  type: 'h2h' | 'spreads' | 'totals';
  bookmakers: ProcessedBookmaker[];
  arbitrageOpportunities: ArbitrageCalculationResult[];
}

export interface ProcessedBookmaker {
  name: string;
  lastUpdate: Date;
  outcomes: ProcessedOutcome[];
}

export interface ProcessedOutcome {
  name: string;
  odds: number;
  point?: number;
}

export interface ArbitrageCalculationResult {
  profitMargin: number;
  totalStake: number;
  bookmaker1: {
    name: string;
    outcome: string;
    odds: number;
    stake: number;
  };
  bookmaker2: {
    name: string;
    outcome: string;
    odds: number;
    stake: number;
  };
  expectedProfit: number;
  probability: number;
}

class OddsApiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;
  private rateLimitDelay: number = 1000; // 1 second between requests

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY || '';
    this.baseURL = process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4';

    if (!this.apiKey) {
      console.warn('NEXT_PUBLIC_ODDS_API_KEY not found. Using demo mode.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        apiKey: this.apiKey,
      },
    });

    // Request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        // Simple rate limiting - wait before each request
        await this.delay(this.rateLimitDelay);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          console.error('Rate limit exceeded. Consider upgrading your plan.');
        } else if (error.response?.status === 401) {
          console.error('Invalid API key. Please check your configuration.');
        }
        return Promise.reject(error);
      }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get available sports
  async getSports(): Promise<OddsApiSport[]> {
    try {
      const response: AxiosResponse<OddsApiSport[]> = await this.client.get('/sports');
      return response.data;
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw error;
    }
  }

  // Get odds for a specific sport
  async getOdds(
    sport: string,
    markets: string[] = ['h2h'], // h2h = head-to-head (moneyline)
    regions: string[] = ['us', 'eu'], // us = American books, eu = European books
    oddsFormat: 'decimal' | 'american' = 'decimal',
    dateFormat: 'iso' | 'unix' = 'iso'
  ): Promise<OddsApiEvent[]> {
    try {
      // First, try to get odds from new bookmaker integrations
      const bookmakerManager = getBookmakerManager();
      const bookmakerOdds = await bookmakerManager.getOdds(sport);
      
      if (bookmakerOdds.length > 0) {
        // Convert bookmaker odds to OddsApiEvent format for compatibility
        const convertedEvents = this.convertBookmakerOddsToEvents(bookmakerOdds, sport);
        if (convertedEvents.length > 0) {
          console.log(`Using ${convertedEvents.length} events from bookmaker integrations`);
          return convertedEvents;
        }
      }

      // Fallback to The Odds API if no bookmaker data available
      console.log('Falling back to The Odds API');
      const response: AxiosResponse<OddsApiEvent[]> = await this.client.get(`/sports/${sport}/odds`, {
        params: {
          markets: markets.join(','),
          regions: regions.join(','),
          oddsFormat,
          dateFormat,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching odds for ${sport}:`, error);
      throw error;
    }
  }

  // Convert bookmaker odds to OddsApiEvent format for compatibility
  private convertBookmakerOddsToEvents(bookmakerOdds: RealTimeOdds[], sport: string): OddsApiEvent[] {
    const eventGroups = new Map<string, OddsApiEvent>();
    
    bookmakerOdds.forEach(odds => {
      const eventKey = `${odds.sport}_${odds.event}`;
      
      if (!eventGroups.has(eventKey)) {
        eventGroups.set(eventKey, {
          id: odds.id,
          sport_key: odds.sport,
          sport_title: this.mapSportKey(odds.sport),
          commence_time: odds.timestamp.toISOString(),
          home_team: odds.event.split(' vs ')[1] || odds.event,
          away_team: odds.event.split(' vs ')[0] || odds.event,
          bookmakers: []
        });
      }
      
      const event = eventGroups.get(eventKey)!;
      let bookmaker = event.bookmakers.find(b => b.key === odds.bookmaker_id);
      
      if (!bookmaker) {
        bookmaker = {
          key: odds.bookmaker_id,
          title: odds.bookmaker_id,
          last_update: odds.timestamp.toISOString(),
          markets: []
        };
        event.bookmakers.push(bookmaker);
      }
      
      let market = bookmaker.markets.find(m => m.key === odds.market);
      if (!market) {
        market = {
          key: odds.market,
          last_update: odds.timestamp.toISOString(),
          outcomes: []
        };
        bookmaker.markets.push(market);
      }
      
      // Add outcome if it doesn't exist
      if (!market.outcomes.find(o => o.name === odds.outcome)) {
        market.outcomes.push({
          name: odds.outcome,
          price: odds.odds
        });
      }
    });
    
    return Array.from(eventGroups.values());
  }

  // Calculate arbitrage opportunities from raw odds data
  calculateArbitrage(events: OddsApiEvent[]): ProcessedOddsData[] {
    return events.map(event => this.processEvent(event));
  }

  private processEvent(event: OddsApiEvent): ProcessedOddsData {
    const processedMarkets: ProcessedMarket[] = [];

    // Group bookmakers by market type
    const marketGroups: Record<string, OddsApiBookmaker[]> = {};

    event.bookmakers.forEach(bookmaker => {
      bookmaker.markets.forEach(market => {
        if (!marketGroups[market.key]) {
          marketGroups[market.key] = [];
        }
        marketGroups[market.key].push({
          ...bookmaker,
          markets: [market]
        });
      });
    });

    // Process each market type
    Object.entries(marketGroups).forEach(([marketKey, bookmakers]) => {
      if (marketKey === 'h2h') {
        const arbitrageOpps = this.findH2HArbitrage(bookmakers);

        processedMarkets.push({
          type: 'h2h',
          bookmakers: bookmakers.map(this.processBookmaker),
          arbitrageOpportunities: arbitrageOpps,
        });
      }
      // TODO: Add spreads and totals processing
    });

    return {
      eventId: event.id,
      sport: this.mapSportKey(event.sport_key),
      event: `${event.away_team} vs ${event.home_team}`,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: new Date(event.commence_time),
      markets: processedMarkets,
    };
  }

  private processBookmaker(bookmaker: OddsApiBookmaker): ProcessedBookmaker {
    const market = bookmaker.markets[0]; // Since we filtered to one market per bookmaker

    return {
      name: this.mapBookmakerName(bookmaker.title),
      lastUpdate: new Date(bookmaker.last_update),
      outcomes: market.outcomes.map(outcome => ({
        name: outcome.name,
        odds: outcome.price,
        point: outcome.point,
      })),
    };
  }

  private findH2HArbitrage(bookmakers: OddsApiBookmaker[]): ArbitrageCalculationResult[] {
    const arbitrageOpportunities: ArbitrageCalculationResult[] = [];

    // For head-to-head betting, we need to find the best odds for each outcome
    const bestOdds: Record<string, { odds: number; bookmaker: string }> = {};

    bookmakers.forEach(bookmaker => {
      const market = bookmaker.markets[0];
      market.outcomes.forEach(outcome => {
        if (!bestOdds[outcome.name] || outcome.price > bestOdds[outcome.name].odds) {
          bestOdds[outcome.name] = {
            odds: outcome.price,
            bookmaker: bookmaker.title,
          };
        }
      });
    });

    // Check for arbitrage opportunities (simplified for 2-way markets)
    const outcomes = Object.keys(bestOdds);
    if (outcomes.length === 2) {
      const [outcome1, outcome2] = outcomes;
      const odds1 = bestOdds[outcome1].odds;
      const odds2 = bestOdds[outcome2].odds;

      // Calculate arbitrage
      const impliedProb1 = 1 / odds1;
      const impliedProb2 = 1 / odds2;
      const totalImpliedProb = impliedProb1 + impliedProb2;

      if (totalImpliedProb < 1) {
        const profitMargin = ((1 - totalImpliedProb) * 100);
        const totalStake = 100000; // Default stake for calculation

        const stake1 = totalStake * (impliedProb1 / totalImpliedProb);
        const stake2 = totalStake * (impliedProb2 / totalImpliedProb);

        const profit1 = stake1 * odds1 - totalStake;
        const profit2 = stake2 * odds2 - totalStake;
        const expectedProfit = Math.min(profit1, profit2);

        arbitrageOpportunities.push({
          profitMargin: parseFloat(profitMargin.toFixed(2)),
          totalStake,
          bookmaker1: {
            name: this.mapBookmakerName(bestOdds[outcome1].bookmaker),
            outcome: outcome1,
            odds: odds1,
            stake: Math.round(stake1),
          },
          bookmaker2: {
            name: this.mapBookmakerName(bestOdds[outcome2].bookmaker),
            outcome: outcome2,
            odds: odds2,
            stake: Math.round(stake2),
          },
          expectedProfit: Math.round(expectedProfit),
          probability: Math.round((1 - totalImpliedProb + 0.9) * 100), // Simulated confidence
        });
      }
    }

    return arbitrageOpportunities;
  }

  private mapSportKey(sportKey: string): string {
    const sportMappings: Record<string, string> = {
      'soccer_epl': 'Labdarúgás',
      'soccer_uefa_champs_league': 'Labdarúgás',
      'basketball_nba': 'Kosárlabda',
      'americanfootball_nfl': 'Amerikai Futball',
      'tennis_atp': 'Tenisz',
      'tennis_wta': 'Tenisz',
      'baseball_mlb': 'Baseball',
      'icehockey_nhl': 'Jégkorong',
      'mma_mixed_martial_arts': 'MMA',
      'boxing_heavyweight': 'Ökölvívás',
    };

    return sportMappings[sportKey] || sportKey;
  }

  private mapBookmakerName(bookmakerTitle: string): string {
    const bookmakerMappings: Record<string, string> = {
      'FanDuel': 'FanDuel',
      'DraftKings': 'DraftKings',
      'BetMGM': 'BetMGM',
      'Caesars': 'Caesars',
      'PointsBet': 'PointsBet',
      'William Hill (US)': 'William Hill',
      'Bovada': 'Bovada',
      'MyBookie.ag': 'MyBookie',
      'BetOnline.ag': 'BetOnline',
      'LowVig.ag': 'LowVig',
    };

    return bookmakerMappings[bookmakerTitle] || bookmakerTitle;
  }

  // Get API usage stats
  async getUsageStats(): Promise<{ requestsUsed: number; requestsRemaining: number }> {
    try {
      // The Odds API returns usage in response headers
      const response = await this.client.get('/sports');

      return {
        requestsUsed: parseInt(response.headers['x-requests-used'] || '0'),
        requestsRemaining: parseInt(response.headers['x-requests-remaining'] || '500'),
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return { requestsUsed: 0, requestsRemaining: 0 };
    }
  }
}

// Singleton instance
export const oddsApiClient = new OddsApiClient();

// Helper function for components
export const fetchArbitrageOpportunities = async (sports: string[] = ['soccer_epl', 'basketball_nba']): Promise<ProcessedOddsData[]> => {
  try {
    const allResults: ProcessedOddsData[] = [];

    for (const sport of sports) {
      const events = await oddsApiClient.getOdds(sport, ['h2h'], ['us', 'eu']);
      const processed = oddsApiClient.calculateArbitrage(events);
      allResults.push(...processed);
    }

    return allResults;
  } catch (error) {
    console.error('Error fetching arbitrage opportunities:', error);
    throw error;
  }
};
