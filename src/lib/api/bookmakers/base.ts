// Base Bookmaker API Interface
// Story 1.1 Task 1: Create Base Bookmaker API Interface

export interface BookmakerIntegration {
  bookmaker_id: string;        // Unique bookmaker identifier
  name: string;                // Bookmaker display name
  api_type: 'REST' | 'GraphQL' | 'WebSocket';
  api_config: {
    base_url: string;
    auth_method: 'api_key' | 'oauth2' | 'hmac';
    rate_limit: {
      requests_per_minute: number;
      requests_per_hour: number;
    };
    headers?: Record<string, string>;
  };
  status: 'active' | 'inactive' | 'error';
  last_sync: Date;
  error_count: number;
  last_error?: string;
}

export interface RealTimeOdds {
  id: string;                  // UUID
  bookmaker_id: string;        // Reference to bookmaker
  sport: string;               // Sport category
  event: string;               // Event name
  market: string;              // Betting market type
  outcome: string;             // Betting outcome
  odds: number;                // Current odds value
  timestamp: Date;             // Odds timestamp
  is_live: boolean;            // Live betting flag
}

// New interfaces for type safety
export interface RawOddsData {
  id?: string;
  sport?: string;
  sport_key?: string;
  event?: string;
  event_name?: string;
  market?: string;
  market_type?: string;
  outcome?: string;
  selection?: string;
  odds?: string | number;
  price?: string | number;
  timestamp?: string | number;
  last_update?: string | number;
  is_live?: boolean;
  live?: boolean;
}

export interface BookmakerEvent {
  id: string;
  name: string;
  sport: string;
  start_time: Date;
  status: 'upcoming' | 'live' | 'finished' | 'completed';
  markets: string[];
}

// New interfaces for API responses
export interface BookmakerSport {
  id: string;
  name: string;
  key?: string;
  active?: boolean;
}

export interface BookmakerEventResponse {
  id: string;
  name: string;
  sport: string;
  sport_key?: string;
  start_time: string | Date;
  status: 'upcoming' | 'live' | 'finished' | 'completed';
  markets?: BookmakerMarket[];
}

export interface BookmakerMarket {
  id: string;
  name: string;
  type: string;
  outcomes: BookmakerOutcome[];
}

export interface BookmakerOutcome {
  id: string;
  name: string;
  odds: number;
  price?: number;
  selection?: string;
}

export interface BookmakerOddsResponse {
  id: string;
  event_id: string;
  sport: string;
  market: string;
  outcome: string;
  odds: number;
  timestamp: string | Date;
  is_live: boolean;
}

export interface BookmakerLiveEvent {
  id: string;
  name: string;
  sport: string;
  status: 'live';
  current_score?: string;
  time_elapsed?: string;
}

export interface BookmakerUpcomingEvent {
  id: string;
  name: string;
  sport: string;
  start_time: string | Date;
  status: 'upcoming';
}

export interface BookmakerLeague {
  id: string;
  name: string;
  sport: string;
  country?: string;
}

export interface BookmakerPeriod {
  id: string;
  name: string;
  number: number;
  status: 'active' | 'finished';
}

export interface BookmakerLineHistory {
  timestamp: string | Date;
  odds: number;
  movement: 'up' | 'down' | 'stable';
}

export interface BookmakerBetData {
  event_id: string;
  market: string;
  outcome: string;
  stake: number;
  odds: number;
}

export interface BookmakerBetResponse {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  stake: number;
  potential_win: number;
  message?: string;
}

export interface BookmakerBetStatus {
  id: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  stake: number;
  payout?: number;
}

export interface BookmakerAPI {
  bookmaker_id: string;
  name: string;
  
  // Core API methods
  initialize(): Promise<void>;
  getOdds(sport?: string, event?: string): Promise<RealTimeOdds[]>;
  getEvents(sport?: string): Promise<BookmakerEvent[]>;
  getSports(): Promise<string[]>;
  
  // Health and status
  checkHealth(): Promise<boolean>;
  getStatus(): BookmakerIntegration;
  
  // Error handling
  handleError(error: Error): void;
  resetErrorCount(): void;
}

// Interface for bookmakers that support disconnection (e.g., WebSocket connections)
export interface DisconnectableBookmakerAPI extends BookmakerAPI {
  disconnect(): void;
}

export interface RateLimitConfig {
  requests_per_minute: number;
  requests_per_hour: number;
  max_concurrent_requests?: number;
}

export class RateLimiter {
  private requestTimes: Date[] = [];
  private config: RateLimitConfig;
  private lastReset: Date = new Date();

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async waitForRateLimit(): Promise<void> {
    const now = new Date();
    
    // Clean old requests
    this.requestTimes = this.requestTimes.filter(time => 
      now.getTime() - time.getTime() < 60000 // Keep only last minute
    );
    
    // Check minute limit
    if (this.requestTimes.length >= this.config.requests_per_minute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now.getTime() - oldestRequest.getTime());
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Check hour limit (simplified)
    const hourAgo = new Date(now.getTime() - 3600000);
    const hourRequests = this.requestTimes.filter(time => time > hourAgo);
    if (hourRequests.length >= this.config.requests_per_hour) {
      const oldestHourRequest = hourRequests[0];
      const waitTime = 3600000 - (now.getTime() - oldestHourRequest.getTime());
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requestTimes.push(now);
  }

  reset(): void {
    this.requestTimes = [];
    this.lastReset = new Date();
  }
}

export class DataTransformer {
  static transformOddsData(rawData: RawOddsData): RealTimeOdds {
    return {
      id: rawData.id || crypto.randomUUID(),
      bookmaker_id: '', // Will be set by the bookmaker
      sport: rawData.sport || rawData.sport_key || '',
      event: rawData.event || rawData.event_name || '',
      market: rawData.market || rawData.market_type || '',
      outcome: rawData.outcome || rawData.selection || '',
      odds: typeof rawData.odds === 'string' ? parseFloat(rawData.odds) : (rawData.odds || 0),
      timestamp: new Date(rawData.timestamp || rawData.last_update || Date.now()),
      is_live: rawData.is_live || rawData.live || false
    };
  }

  static transformEventData(rawData: BookmakerEventResponse): BookmakerEvent {
    return {
      id: rawData.id,
      name: rawData.name,
      sport: rawData.sport,
      start_time: new Date(rawData.start_time),
      status: rawData.status,
      markets: rawData.markets?.map(m => m.name) || []
    };
  }

  static transformSportsData(rawData: BookmakerSport[]): string[] {
    return rawData.map(sport => sport.name);
  }
}

// Base class for all bookmaker APIs
export abstract class BaseBookmakerAPI implements BookmakerAPI {
  public bookmaker_id: string;
  public name: string;
  protected rateLimiter: RateLimiter;
  protected status: BookmakerIntegration;
  protected errorCount: number = 0;
  protected lastError?: string;

  constructor(bookmaker_id: string, name: string, config: BookmakerIntegration['api_config']) {
    this.bookmaker_id = bookmaker_id;
    this.name = name;
    this.rateLimiter = new RateLimiter(config.rate_limit);
    this.status = {
      bookmaker_id,
      name,
      api_type: 'REST', // Default, can be overridden
      api_config: config,
      status: 'inactive',
      last_sync: new Date(),
      error_count: 0
    };
  }

  abstract initialize(): Promise<void>;
  abstract getOdds(sport?: string, event?: string): Promise<RealTimeOdds[]>;
  abstract getEvents(sport?: string): Promise<BookmakerEvent[]>;
  abstract getSports(): Promise<string[]>;

  async checkHealth(): Promise<boolean> {
    try {
      await this.getSports();
      this.status.status = 'active';
      this.status.last_sync = new Date();
      this.resetErrorCount();
      return true;
    } catch (error) {
      this.handleError(error as Error);
      return false;
    }
  }

  getStatus(): BookmakerIntegration {
    return { ...this.status, error_count: this.errorCount, last_error: this.lastError };
  }

  handleError(error: Error): void {
    this.errorCount++;
    this.lastError = error.message;
    this.status.status = this.errorCount > 5 ? 'error' : 'active';
    this.status.last_sync = new Date();
  }

  resetErrorCount(): void {
    this.errorCount = 0;
    this.lastError = undefined;
    this.status.status = 'active';
  }

  protected async waitForRateLimit(): Promise<void> {
    await this.rateLimiter.waitForRateLimit();
  }
}
