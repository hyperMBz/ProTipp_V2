// Server-Sent Events Manager for Real-time Data Fallback
interface SSEConfig {
  url: string;
  authToken?: string;
  retryInterval?: number;
  maxRetries?: number;
  timeout?: number;
}

interface SSEConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastEventTime: Date | null;
  retryCount: number;
  errorMessage?: string;
}

class SSEManager {
  private eventSource: EventSource | null = null;
  private config: SSEConfig;
  private status: SSEConnectionStatus = {
    status: 'disconnected',
    lastEventTime: null,
    retryCount: 0,
  };
  private eventHandlers: Map<string, ((data: unknown) => void)[]> = new Map();
  private retryTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: SSEConfig) {
    this.config = {
      retryInterval: 5000,
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };
  }

  public async connect(): Promise<void> {
    if (this.status.status === 'connected' || this.status.status === 'connecting') {
      console.log('SSE already connected or connecting');
      return;
    }

    this.status.status = 'connecting';
    this.status.retryCount = 0;

    try {
      await this.establishConnection();
    } catch (error) {
      console.error('SSE connection failed:', error);
      this.status.status = 'error';
      this.status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.scheduleRetry();
    }
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.config.url);
      
      // Add authentication token to URL if provided
      if (this.config.authToken) {
        url.searchParams.append('token', this.config.authToken);
      }

      this.eventSource = new EventSource(url.toString());

      const timeout = setTimeout(() => {
        this.cleanup();
        reject(new Error('SSE connection timeout'));
      }, this.config.timeout);

      this.eventSource.onopen = () => {
        clearTimeout(timeout);
        console.log('SSE connection established');
        this.status.status = 'connected';
        this.status.lastEventTime = new Date();
        this.reconnectAttempts = 0;
        resolve();
      };

      this.eventSource.onerror = (error) => {
        clearTimeout(timeout);
        console.error('SSE connection error:', error);
        this.status.status = 'error';
        this.status.errorMessage = 'Connection error';
        this.cleanup();
        reject(new Error('SSE connection failed'));
      };

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event);
      };

      // Set up specific event handlers
      this.setupEventHandlers();
    });
  }

  private setupEventHandlers(): void {
    if (!this.eventSource) return;

    // Handle odds updates
    this.eventSource.addEventListener('odds_update', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('odds_update', data);
      } catch (error) {
        console.error('Failed to parse odds_update event:', error);
      }
    });

    // Handle connection status
    this.eventSource.addEventListener('connection_status', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('connection_status', data);
      } catch (error) {
        console.error('Failed to parse connection_status event:', error);
      }
    });

    // Handle heartbeat
    this.eventSource.addEventListener('heartbeat', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.status.lastEventTime = new Date();
        this.emit('heartbeat', data);
      } catch (error) {
        console.error('Failed to parse heartbeat event:', error);
      }
    });

    // Handle error events
    this.eventSource.addEventListener('error', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        this.emit('error', data);
      } catch (error) {
        console.error('Failed to parse error event:', error);
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    this.status.lastEventTime = new Date();
    
    try {
      const data = JSON.parse(event.data);
      this.emit('message', data);
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  }

  private scheduleRetry(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('SSE max reconnection attempts reached');
      return;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const retryDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`SSE retrying connection in ${retryDelay}ms (attempt ${this.reconnectAttempts})`);

    this.retryTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('SSE retry failed:', error);
      });
    }, retryDelay);
  }

  public disconnect(): void {
    this.cleanup();
    this.status.status = 'disconnected';
    this.status.lastEventTime = null;
    this.status.errorMessage = undefined;
    this.reconnectAttempts = 0;
  }

  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
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
          console.error(`Error in SSE event handler for ${event}:`, error);
        }
      });
    }
  }

  // Getters for status information
  public getStatus(): SSEConnectionStatus {
    return { ...this.status };
  }

  public isConnected(): boolean {
    return this.status.status === 'connected';
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public getLastEventTime(): Date | null {
    return this.status.lastEventTime;
  }

  // Health check method
  public isHealthy(): boolean {
    if (!this.isConnected()) return false;
    
    // Check if we've received any events recently (within last 2 minutes)
    if (this.status.lastEventTime) {
      const timeSinceLastEvent = Date.now() - this.status.lastEventTime.getTime();
      return timeSinceLastEvent < 120000; // 2 minutes
    }
    
    return false;
  }
}

export default SSEManager;
export type { SSEConfig, SSEConnectionStatus };
