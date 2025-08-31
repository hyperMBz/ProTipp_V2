// Polling Fallback Manager for Real-time Data
import { getBookmakerManager } from '../bookmakers/manager';

interface PollingConfig {
  interval: number;
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffInterval: number;
  authToken?: string;
}

interface PollingStatus {
  isActive: boolean;
  lastPollTime: Date | null;
  retryCount: number;
  currentInterval: number;
  errorCount: number;
  lastError?: string;
}

class PollingFallback {
  private config: PollingConfig;
  private status: PollingStatus = {
    isActive: false,
    lastPollTime: null,
    retryCount: 0,
    currentInterval: 5000,
    errorCount: 0,
  };
  private pollingInterval: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, ((data: unknown) => void)[]> = new Map();
  private bookmakerManager = getBookmakerManager();

  constructor(config: Partial<PollingConfig> = {}) {
    this.config = {
      interval: 5000, // 5 seconds default
      maxRetries: 3,
      backoffMultiplier: 2,
      maxBackoffInterval: 60000, // 1 minute max
      ...config,
    };
    this.status.currentInterval = this.config.interval;
  }

  public async start(): Promise<void> {
    if (this.status.isActive) {
      console.log('Polling already active');
      return;
    }

    console.log('Starting polling fallback');
    this.status.isActive = true;
    this.status.retryCount = 0;
    this.status.errorCount = 0;
    this.status.currentInterval = this.config.interval;

    await this.performPoll();
    this.scheduleNextPoll();
  }

  public stop(): void {
    console.log('Stopping polling fallback');
    this.status.isActive = false;
    
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async performPoll(): Promise<void> {
    if (!this.status.isActive) return;

    try {
      console.log('Performing polling request');
      this.status.lastPollTime = new Date();

      // Get odds data from bookmaker manager
      const oddsData = await this.bookmakerManager.getOdds();
      
      // Process and emit odds updates
      await this.processOddsUpdates(oddsData);
      
      // Reset error count on successful poll
      this.status.errorCount = 0;
      this.status.retryCount = 0;
      this.status.currentInterval = this.config.interval;

    } catch (error) {
      console.error('Polling request failed:', error);
      this.handlePollingError(error);
    }
  }

  private async processOddsUpdates(oddsData: unknown[]): Promise<void> {
    for (const odds of oddsData) {
      try {
              // Emit odds update event
      const oddsData = odds as { bookmaker_id: string; event_id: string; market: string; outcome: string; odds: number };
      this.emit('odds_update', {
        bookmaker_id: oddsData.bookmaker_id,
        event_id: oddsData.event_id,
        market: oddsData.market,
        outcome: oddsData.outcome,
        odds: oddsData.odds,
        timestamp: new Date(),
        is_significant: this.isSignificantOddsChange(odds),
      });

        // Emit connection status
        this.emit('connection_status', {
          type: 'polling',
          status: 'active',
          last_update: new Date(),
          latency_ms: 0, // Polling doesn't have real-time latency
        });

      } catch (error) {
        console.error('Error processing odds update:', error);
      }
    }
  }

  private isSignificantOddsChange(odds: unknown): boolean {
    // Simple logic to determine if odds change is significant
    // This could be enhanced with more sophisticated algorithms
    const oddsData = odds as { odds?: number; previous_odds?: number };
    if (!oddsData.previous_odds || !oddsData.odds) return false;
    
    const change = Math.abs(oddsData.odds - oddsData.previous_odds);
    const percentageChange = (change / oddsData.previous_odds) * 100;
    
    return percentageChange > 5; // 5% change threshold
  }

  private handlePollingError(error: unknown): void {
    this.status.errorCount++;
    this.status.lastError = error instanceof Error ? error.message : 'Unknown error';

    if (this.status.errorCount >= this.config.maxRetries) {
      console.error('Max polling retries reached, stopping polling');
      this.stop();
      this.emit('polling_failed', {
        error: this.status.lastError,
        retryCount: this.status.retryCount,
      });
      return;
    }

    // Implement exponential backoff
    this.status.currentInterval = Math.min(
      this.status.currentInterval * this.config.backoffMultiplier,
      this.config.maxBackoffInterval
    );

    this.status.retryCount++;
    console.log(`Polling failed, retrying in ${this.status.currentInterval}ms (attempt ${this.status.retryCount})`);

    // Schedule retry with backoff
    this.scheduleNextPoll();
  }

  private scheduleNextPoll(): void {
    if (!this.status.isActive) return;

    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }

    this.pollingInterval = setTimeout(() => {
      this.performPoll();
    }, this.status.currentInterval);
  }

  public on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  public off(event: string, callback: (data: unknown) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in polling event handler for ${event}:`, error);
        }
      });
    }
  }

  // Getters for status information
  public getStatus(): PollingStatus {
    return { ...this.status };
  }

  public isActive(): boolean {
    return this.status.isActive;
  }

  public getCurrentInterval(): number {
    return this.status.currentInterval;
  }

  public getErrorCount(): number {
    return this.status.errorCount;
  }

  public getRetryCount(): number {
    return this.status.retryCount;
  }

  public getLastPollTime(): Date | null {
    return this.status.lastPollTime;
  }

  // Health check method
  public isHealthy(): boolean {
    if (!this.status.isActive) return false;
    
    // Check if we've polled recently (within last 2 minutes)
    if (this.status.lastPollTime) {
      const timeSinceLastPoll = Date.now() - this.status.lastPollTime.getTime();
      return timeSinceLastPoll < 120000; // 2 minutes
    }
    
    return false;
  }

  // Method to manually trigger a poll
  public async triggerPoll(): Promise<void> {
    if (this.status.isActive) {
      await this.performPoll();
    }
  }

  // Method to reset polling interval
  public resetInterval(): void {
    this.status.currentInterval = this.config.interval;
    this.status.errorCount = 0;
    this.status.retryCount = 0;
  }
}

export default PollingFallback;
export type { PollingConfig, PollingStatus };
