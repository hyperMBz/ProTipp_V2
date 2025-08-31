// WebSocket Manager with Authentication and Security
import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  url: string;
  authToken?: string;
  rateLimitPerMinute?: number;
  maxReconnectionAttempts?: number;
  reconnectionDelay?: number;
  heartbeatInterval?: number;
}

interface RateLimitInfo {
  messageCount: number;
  resetTime: number;
}

class WebSocketManager {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private reconnectionAttempts: number = 0;
  private rateLimitInfo: RateLimitInfo = { messageCount: 0, resetTime: Date.now() };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isAuthenticated: boolean = false;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor(config: WebSocketConfig) {
    this.config = {
      rateLimitPerMinute: 100,
      maxReconnectionAttempts: 5,
      reconnectionDelay: 1000,
      heartbeatInterval: 30000,
      ...config
    };
  }

  public async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.connectionStatus = 'connecting';
    
    const authHeaders: Record<string, string> = {};
    if (this.config.authToken) {
      authHeaders.Authorization = `Bearer ${this.config.authToken}`;
    }

    this.socket = io(this.config.url, {
      reconnection: true,
      reconnectionAttempts: this.config.maxReconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      auth: authHeaders,
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectionStatus = 'connected';
      this.reconnectionAttempts = 0;
      this.isAuthenticated = true;
      this.startHeartbeat();
      this.resetRateLimit();
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.connectionStatus = 'connected';
      this.startHeartbeat();
      this.resetRateLimit();
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('WebSocket attempting to reconnect');
      this.connectionStatus = 'connecting';
      this.reconnectionAttempts++;
    });

    this.socket.on('reconnect_error', (error: Error) => {
      console.error('WebSocket reconnection error:', error);
      this.connectionStatus = 'error';
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.connectionStatus = 'error';
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.isAuthenticated = false;
      this.stopHeartbeat();
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus = 'error';
    });

    this.socket.on('auth_error', (error: Error) => {
      console.error('WebSocket authentication error:', error);
      this.isAuthenticated = false;
      this.connectionStatus = 'error';
    });

    this.socket.on('rate_limit_exceeded', (data: { retryAfter: number }) => {
      console.warn(`Rate limit exceeded. Retry after ${data.retryAfter} seconds`);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connectionStatus = 'disconnected';
      this.isAuthenticated = false;
    }
  }

  public on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public emit(event: string, data: unknown): boolean {
    if (!this.socket?.connected) {
      console.error('WebSocket is not connected');
      return false;
    }

    if (!this.isAuthenticated) {
      console.error('WebSocket is not authenticated');
      return false;
    }

    if (!this.checkRateLimit()) {
      console.error('Rate limit exceeded');
      return false;
    }

    if (!this.validateMessage(event, data)) {
      console.error('Invalid message format');
      return false;
    }

    this.socket.emit(event, data);
    this.incrementMessageCount();
    return true;
  }

  private validateMessage(event: string, data: unknown): boolean {
    // Basic message validation
    if (typeof event !== 'string' || event.length === 0) {
      return false;
    }

    // Validate odds update messages
    if (event === 'odds_update') {
      return this.validateOddsUpdate(data);
    }

    // Validate heartbeat messages
    if (event === 'heartbeat') {
      return this.validateHeartbeat(data);
    }

    return true;
  }

  private validateOddsUpdate(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const oddsData = data as Record<string, unknown>;
    const requiredFields = ['bookmaker_id', 'event_id', 'market', 'outcome', 'odds'];
    
    return requiredFields.every(field => 
      oddsData[field] !== undefined && oddsData[field] !== null
    );
  }

  private validateHeartbeat(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const heartbeatData = data as Record<string, unknown>;
    return typeof heartbeatData.timestamp === 'number';
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset rate limit if a minute has passed
    if (now > this.rateLimitInfo.resetTime) {
      this.resetRateLimit();
    }

    return this.rateLimitInfo.messageCount < (this.config.rateLimitPerMinute || 100);
  }

  private resetRateLimit(): void {
    this.rateLimitInfo = {
      messageCount: 0,
      resetTime: Date.now() + 60000 // Reset in 1 minute
    };
  }

  private incrementMessageCount(): void {
    this.rateLimitInfo.messageCount++;
  }

  public async measureLatency(): Promise<number> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket is not connected');
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      (this.socket as Socket).emit('ping', (pongTime: number) => {
        const latency = Date.now() - startTime;
        resolve(latency);
      });

      // Set a timeout to reject if no pong is received
      setTimeout(() => {
        reject(new Error('No pong received'));
      }, 5000); // 5 seconds timeout
    });
  }

  public sendHeartbeat(): void {
    if (this.socket?.connected) {
      this.socket.emit('heartbeat', { timestamp: Date.now() });
    }
  }

  public startHeartbeat(): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket is not connected');
    }

    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Getters for status information
  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public isAuth(): boolean {
    return this.isAuthenticated;
  }

  public getReconnectionAttempts(): number {
    return this.reconnectionAttempts;
  }

  public getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }
}

export default WebSocketManager;
export type { WebSocketConfig, RateLimitInfo };
