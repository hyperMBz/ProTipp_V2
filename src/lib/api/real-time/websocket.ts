// WebSocket Manager
import { io, Socket } from 'socket.io-client';

class WebSocketManager {
  private socket: Socket | null = null;
  private url: string;
  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 5;
  private reconnectionDelay: number = 1000; // 1 second

  constructor(url: string) {
    this.url = url;
  }

  public connect(): void {
    this.socket = io(this.url, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectionAttempts,
      reconnectionDelay: this.reconnectionDelay,
    });

this.socket.on('connect', () => {
  console.log('WebSocket connected');
  this.reconnectionAttempts = 0;
  this.startHeartbeat();
});

this.socket.on('reconnect', (attemptNumber: number) => {
  console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
  this.startHeartbeat();
});

this.socket.on('reconnect_attempt', () => {
  console.log('WebSocket attempting to reconnect');
  this.reconnectionAttempts++;
});

this.socket.on('reconnect_error', (error: Error) => {
  console.error('WebSocket reconnection error:', error);
});

this.socket.on('reconnect_failed', () => {
  console.error('WebSocket reconnection failed');
});

this.socket.on('disconnect', (reason: string) => {
  console.log('WebSocket disconnected:', reason);
  this.stopHeartbeat();
});

this.socket.on('error', (error: Error) => {
  console.error('WebSocket error:', error);
});
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public emit(event: string, data: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

public async measureLatency(): Promise<number> {
  if (!this.socket) {
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
  if (this.socket) {
    this.socket.emit('heartbeat', { timestamp: Date.now() });
  }
}

private heartbeatInterval: NodeJS.Timeout | null = null;
private heartbeatIntervalTime: number = 30000; // 30 seconds

public startHeartbeat(): void {
  if (!this.socket) {
    throw new Error('WebSocket is not connected');
  }

  this.heartbeatInterval = setInterval(() => {
    this.sendHeartbeat();
  }, this.heartbeatIntervalTime);
}

public stopHeartbeat(): void {
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }
}
}

export default WebSocketManager;
