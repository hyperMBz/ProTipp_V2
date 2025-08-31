// Centralized Real-time Connection Manager
import WebSocketManager, { type WebSocketConfig } from './websocket';
import SSEManager, { type SSEConfig } from './sse';
import PollingFallback, { type PollingConfig } from './fallback';

interface ConnectionManagerConfig {
  websocket?: WebSocketConfig;
  sse?: SSEConfig;
  polling?: PollingConfig;
  preferredMethod: 'websocket' | 'sse' | 'polling';
  fallbackOrder: ('websocket' | 'sse' | 'polling')[];
  healthCheckInterval: number;
  autoReconnect: boolean;
}

interface ConnectionStatus {
  method: 'websocket' | 'sse' | 'polling' | 'none';
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency: number;
  lastUpdate: Date | null;
  errorMessage?: string;
  isHealthy: boolean;
}

interface BookmakerConnectionStatus {
  [bookmakerId: string]: ConnectionStatus;
}

class ConnectionManager {
  private config: ConnectionManagerConfig;
  private websocketManager: WebSocketManager | null = null;
  private sseManager: SSEManager | null = null;
  private pollingFallback: PollingFallback | null = null;
  private currentMethod: 'websocket' | 'sse' | 'polling' | 'none' = 'none';
  private connectionStatus: ConnectionStatus = {
    method: 'none',
    status: 'disconnected',
    latency: 0,
    lastUpdate: null,
    isHealthy: false,
  };
  private bookmakerStatuses: BookmakerConnectionStatus = {};
  private eventHandlers: Map<string, ((data: unknown) => void)[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: Partial<ConnectionManagerConfig> = {}) {
    this.config = {
      preferredMethod: 'websocket',
      fallbackOrder: ['websocket', 'sse', 'polling'],
      healthCheckInterval: 30000, // 30 seconds
      autoReconnect: true,
      ...config,
    };
  }

  public async connect(): Promise<void> {
    console.log('Starting connection manager');
    
    // Initialize connection methods
    await this.initializeConnections();
    
    // Try to connect using preferred method
    await this.tryConnect(this.config.preferredMethod);
    
    // Start health monitoring
    this.startHealthMonitoring();
  }

  private async initializeConnections(): Promise<void> {
    // Initialize WebSocket manager
    if (this.config.websocket) {
      this.websocketManager = new WebSocketManager(this.config.websocket);
      this.setupWebSocketHandlers();
    }

    // Initialize SSE manager
    if (this.config.sse) {
      this.sseManager = new SSEManager(this.config.sse);
      this.setupSSEHandlers();
    }

    // Initialize polling fallback
    if (this.config.polling) {
      this.pollingFallback = new PollingFallback(this.config.polling);
      this.setupPollingHandlers();
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.websocketManager) return;

    this.websocketManager.on('connect', () => {
      this.updateConnectionStatus('websocket', 'connected');
    });

    this.websocketManager.on('disconnect', () => {
      this.updateConnectionStatus('websocket', 'disconnected');
      this.handleConnectionFailure('websocket');
    });

    this.websocketManager.on('error', (error) => {
      this.updateConnectionStatus('websocket', 'error', error instanceof Error ? error.message : 'Unknown error');
      this.handleConnectionFailure('websocket');
    });
  }

  private setupSSEHandlers(): void {
    if (!this.sseManager) return;

    this.sseManager.on('connection_status', (data: unknown) => {
      const statusData = data as { status: string };
      this.updateConnectionStatus('sse', statusData.status as 'connected' | 'connecting' | 'disconnected' | 'error');
    });

    this.sseManager.on('error', (data: unknown) => {
      const error = data as Error;
      this.updateConnectionStatus('sse', 'error', error.message);
      this.handleConnectionFailure('sse');
    });
  }

  private setupPollingHandlers(): void {
    if (!this.pollingFallback) return;

    this.pollingFallback.on('connection_status', (data) => {
      this.updateConnectionStatus('polling', 'connected');
    });

    this.pollingFallback.on('polling_failed', (data: unknown) => {
      const error = data as Error;
      this.updateConnectionStatus('polling', 'error', error.message);
      this.handleConnectionFailure('polling');
    });
  }

  private async tryConnect(method: 'websocket' | 'sse' | 'polling'): Promise<boolean> {
    console.log(`Attempting to connect using ${method}`);
    
    try {
      this.updateConnectionStatus(method, 'connecting');

      switch (method) {
        case 'websocket':
          if (this.websocketManager) {
            await this.websocketManager.connect();
            return true;
          }
          break;

        case 'sse':
          if (this.sseManager) {
            await this.sseManager.connect();
            return true;
          }
          break;

        case 'polling':
          if (this.pollingFallback) {
            await this.pollingFallback.start();
            return true;
          }
          break;
      }

      return false;
    } catch (error) {
      console.error(`Failed to connect using ${method}:`, error);
      this.updateConnectionStatus(method, 'error', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  private async handleConnectionFailure(failedMethod: 'websocket' | 'sse' | 'polling'): Promise<void> {
    console.log(`Connection failed for ${failedMethod}, attempting fallback`);
    
    if (!this.config.autoReconnect) {
      return;
    }

    // Find next method in fallback order
    const currentIndex = this.config.fallbackOrder.indexOf(failedMethod);
    const nextMethod = this.config.fallbackOrder[currentIndex + 1];

    if (nextMethod) {
      // Disconnect current method
      await this.disconnectMethod(failedMethod);
      
      // Try next method
      const success = await this.tryConnect(nextMethod);
      if (success) {
        this.currentMethod = nextMethod;
        this.reconnectAttempts = 0;
      } else {
        // Try next method in chain
        await this.handleConnectionFailure(nextMethod);
      }
    } else {
      // All methods failed, implement exponential backoff
      this.implementExponentialBackoff();
    }
  }

  private async disconnectMethod(method: 'websocket' | 'sse' | 'polling'): Promise<void> {
    switch (method) {
      case 'websocket':
        if (this.websocketManager) {
          this.websocketManager.disconnect();
        }
        break;

      case 'sse':
        if (this.sseManager) {
          this.sseManager.disconnect();
        }
        break;

      case 'polling':
        if (this.pollingFallback) {
          this.pollingFallback.stop();
        }
        break;
    }
  }

  private implementExponentialBackoff(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionStatus('none', 'error', 'Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`All connection methods failed, retrying in ${backoffDelay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(async () => {
      // Try to reconnect with preferred method
      const success = await this.tryConnect(this.config.preferredMethod);
      if (success) {
        this.currentMethod = this.config.preferredMethod;
        this.reconnectAttempts = 0;
      }
    }, backoffDelay);
  }

  private updateConnectionStatus(
    method: 'websocket' | 'sse' | 'polling' | 'none',
    status: 'connected' | 'connecting' | 'disconnected' | 'error',
    errorMessage?: string
  ): void {
    this.connectionStatus = {
      method,
      status,
      latency: this.getCurrentLatency(),
      lastUpdate: new Date(),
      errorMessage,
      isHealthy: this.isConnectionHealthy(method, status),
    };

    // Emit status update
    this.emit('connection_status', this.connectionStatus);
  }

  private getCurrentLatency(): number {
    switch (this.currentMethod) {
      case 'websocket':
        return this.websocketManager?.getRateLimitInfo().messageCount || 0;
      case 'sse':
        return this.sseManager?.getReconnectAttempts() || 0;
      case 'polling':
        return this.pollingFallback?.getCurrentInterval() || 0;
      default:
        return 0;
    }
  }

  private isConnectionHealthy(method: string, status: string): boolean {
    if (status !== 'connected') return false;

    switch (method) {
      case 'websocket':
        return this.websocketManager?.isConnected() || false;
      case 'sse':
        return this.sseManager?.isHealthy() || false;
      case 'polling':
        return this.pollingFallback?.isHealthy() || false;
      default:
        return false;
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    const isHealthy = this.isConnectionHealthy(this.currentMethod, this.connectionStatus.status);
    
    if (!isHealthy && this.config.autoReconnect) {
      console.log('Health check failed, attempting reconnection');
      if (this.currentMethod !== 'none') {
        await this.handleConnectionFailure(this.currentMethod);
      }
    }

    // Update health status
    this.connectionStatus.isHealthy = isHealthy;
    this.emit('health_check', { isHealthy, method: this.currentMethod });
  }

  public disconnect(): void {
    console.log('Disconnecting all real-time connections');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.websocketManager) {
      this.websocketManager.disconnect();
    }

    if (this.sseManager) {
      this.sseManager.disconnect();
    }

    if (this.pollingFallback) {
      this.pollingFallback.stop();
    }

    this.updateConnectionStatus('none', 'disconnected');
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
          console.error(`Error in connection manager event handler for ${event}:`, error);
        }
      });
    }
  }

  // Public methods for external access
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public getCurrentMethod(): string {
    return this.currentMethod;
  }

  public isConnected(): boolean {
    return this.connectionStatus.status === 'connected';
  }

  public isHealthy(): boolean {
    return this.connectionStatus.isHealthy;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Method to manually switch connection method
  public async switchMethod(method: 'websocket' | 'sse' | 'polling'): Promise<boolean> {
    console.log(`Manually switching to ${method}`);
    
    // Disconnect current method
    if (this.currentMethod !== 'none') {
      await this.disconnectMethod(this.currentMethod);
    }
    
    // Try new method
    const success = await this.tryConnect(method);
    if (success) {
      this.currentMethod = method;
      this.reconnectAttempts = 0;
    }
    
    return success;
  }

  // Method to get bookmaker-specific status
  public getBookmakerStatus(bookmakerId: string): ConnectionStatus | null {
    return this.bookmakerStatuses[bookmakerId] || null;
  }

  // Method to update bookmaker status
  public updateBookmakerStatus(bookmakerId: string, status: Partial<ConnectionStatus>): void {
    this.bookmakerStatuses[bookmakerId] = {
      ...this.bookmakerStatuses[bookmakerId],
      ...status,
    };
    
    this.emit('bookmaker_status_update', {
      bookmakerId,
      status: this.bookmakerStatuses[bookmakerId],
    });
  }
}

export default ConnectionManager;
export type { ConnectionManagerConfig, ConnectionStatus, BookmakerConnectionStatus };
