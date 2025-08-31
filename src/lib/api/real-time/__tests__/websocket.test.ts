import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WebSocketManager, { type WebSocketConfig } from '../websocket';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: false,
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  } as unknown)),
}));

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  let mockSocket: Record<string, unknown>;

  const defaultConfig: WebSocketConfig = {
    url: 'ws://localhost:3000',
    authToken: 'test-token',
    rateLimitPerMinute: 100,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    wsManager = new WebSocketManager(defaultConfig);
    
    // Get the mocked socket instance
    const { io } = await import('socket.io-client');
    mockSocket = io() as unknown as Record<string, unknown>;
  });

  afterEach(() => {
    wsManager.disconnect();
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const manager = new WebSocketManager({ url: 'ws://test.com' });
      expect(manager.getConnectionStatus()).toBe('disconnected');
      expect(manager.isConnected()).toBe(false);
      expect(manager.isAuth()).toBe(false);
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig: WebSocketConfig = {
        url: 'ws://custom.com',
        rateLimitPerMinute: 50,
        maxReconnectionAttempts: 10,
      };
      
      const manager = new WebSocketManager(customConfig);
      expect(manager.getRateLimitInfo().messageCount).toBe(0);
    });
  });

  describe('Connection Management', () => {
    it('should connect with authentication headers', async () => {
      const { io } = await import('socket.io-client');
      
      await wsManager.connect();
      
      expect(io).toHaveBeenCalledWith('ws://localhost:3000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { Authorization: 'Bearer test-token' },
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });
    });

    it('should not connect if already connected', async () => {
      mockSocket.connected = true;
      
      await wsManager.connect();
      await wsManager.connect(); // Second call should be ignored
      
      expect(mockSocket.on).toHaveBeenCalledTimes(1); // Only first call should set up handlers
    });

    it('should handle connection events', async () => {
      await wsManager.connect();
      
      // Simulate connection event
      const connectCallback = (mockSocket as any).on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'connect'
      )?.[1] as (() => void);
      
      connectCallback();
      
      expect(wsManager.getConnectionStatus()).toBe('connected');
      expect(wsManager.isAuth()).toBe(true);
    });

    it('should handle disconnection events', async () => {
      await wsManager.connect();
      
      // Simulate disconnect event
      const disconnectCallback = (mockSocket as any).on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'disconnect'
      )?.[1] as ((reason: string) => void);
      
      disconnectCallback('test reason');
      
      expect(wsManager.getConnectionStatus()).toBe('disconnected');
      expect(wsManager.isAuth()).toBe(false);
    });
  });

  describe('Message Validation', () => {
    beforeEach(async () => {
      await wsManager.connect();
      mockSocket.connected = true;
      
      // Simulate successful connection
      const connectCallback = (mockSocket as any).on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'connect'
      )?.[1] as (() => void);
      connectCallback();
    });

    it('should validate odds update messages', () => {
      const validOddsUpdate = {
        bookmaker_id: 'bet365',
        event_id: '123',
        market: 'h2h',
        outcome: 'home',
        odds: 2.5,
      };

      const result = wsManager.emit('odds_update', validOddsUpdate);
      expect(result).toBe(true);
      expect((mockSocket as any).emit).toHaveBeenCalledWith('odds_update', validOddsUpdate);
    });

    it('should reject invalid odds update messages', () => {
      const invalidOddsUpdate = {
        bookmaker_id: 'bet365',
        // Missing required fields
      };

      const result = wsManager.emit('odds_update', invalidOddsUpdate);
      expect(result).toBe(false);
      expect((mockSocket as any).emit).not.toHaveBeenCalled();
    });

    it('should validate heartbeat messages', () => {
      const validHeartbeat = { timestamp: Date.now() };
      
      const result = wsManager.emit('heartbeat', validHeartbeat);
      expect(result).toBe(true);
      expect((mockSocket as any).emit).toHaveBeenCalledWith('heartbeat', validHeartbeat);
    });

    it('should reject invalid heartbeat messages', () => {
      const invalidHeartbeat = { timestamp: 'invalid' };
      
      const result = wsManager.emit('heartbeat', invalidHeartbeat);
      expect(result).toBe(false);
      expect((mockSocket as any).emit).not.toHaveBeenCalled();
    });

    it('should reject empty event names', () => {
      const result = wsManager.emit('', { data: 'test' });
      expect(result).toBe(false);
      expect((mockSocket as any).emit).not.toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(async () => {
      await wsManager.connect();
      mockSocket.connected = true;
      
      // Simulate successful connection
      const connectCallback = (mockSocket as any).on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'connect'
      )?.[1] as (() => void);
      connectCallback();
    });

    it('should allow messages within rate limit', () => {
      const message = { test: 'data' };
      
      // Send 50 messages (within 100 per minute limit)
      for (let i = 0; i < 50; i++) {
        const result = wsManager.emit('test_event', message);
        expect(result).toBe(true);
      }
      
      expect((mockSocket as any).emit).toHaveBeenCalledTimes(50);
    });

    it('should reject messages when rate limit exceeded', () => {
      const message = { test: 'data' };
      
      // Send 101 messages (exceeds 100 per minute limit)
      for (let i = 0; i < 100; i++) {
        wsManager.emit('test_event', message);
      }
      
      // 101st message should be rejected
      const result = wsManager.emit('test_event', message);
      expect(result).toBe(false);
      expect((mockSocket as any).emit).toHaveBeenCalledTimes(100);
    });

    it('should reset rate limit after connection', async () => {
      // Send some messages
      for (let i = 0; i < 50; i++) {
        wsManager.emit('test_event', { data: 'test' });
      }
      
      // Disconnect and reconnect
      wsManager.disconnect();
      await wsManager.connect();
      mockSocket.connected = true;
      
      const connectCallback = (mockSocket as any).on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'connect'
      )?.[1] as (() => void);
      connectCallback();
      
      // Should be able to send messages again
      const result = wsManager.emit('test_event', { data: 'test' });
      expect(result).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should reject messages when not authenticated', () => {
      const result = wsManager.emit('test_event', { data: 'test' });
      expect(result).toBe(false);
      expect((mockSocket as any).emit).not.toHaveBeenCalled();
    });

    it('should reject messages when not connected', () => {
      const result = wsManager.emit('test_event', { data: 'test' });
      expect(result).toBe(false);
      expect((mockSocket as any).emit).not.toHaveBeenCalled();
    });
  });

  describe('Latency Measurement', () => {
    beforeEach(async () => {
      await wsManager.connect();
      mockSocket.connected = true;
    });

    it('should measure latency correctly', async () => {
      const startTime = Date.now();
      const expectedLatency = 50;
      
      // Mock the ping callback
      (mockSocket as any).emit.mockImplementation((event: string, callback: (timestamp: number) => void) => {
        if (event === 'ping' && typeof callback === 'function') {
          setTimeout(() => callback(startTime + expectedLatency), expectedLatency);
        }
      });

      const latency = await wsManager.measureLatency();
      expect(latency).toBeGreaterThanOrEqual(expectedLatency);
    });

    it('should reject latency measurement when not connected', async () => {
      wsManager.disconnect();
      
      await expect(wsManager.measureLatency()).rejects.toThrow(
        'WebSocket is not connected'
      );
    });

    it('should timeout if no pong received', async () => {
      // Mock emit without calling the callback
      (mockSocket as any).emit.mockImplementation(() => {
        // Don't call the callback
      });

      await expect(wsManager.measureLatency()).rejects.toThrow('No pong received');
    });
  });

  describe('Heartbeat Management', () => {
    beforeEach(async () => {
      await wsManager.connect();
      mockSocket.connected = true;
      
      const connectCallback = (mockSocket as any).on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'connect'
      )?.[1] as (() => void);
      connectCallback();
    });

    it('should start heartbeat on connection', () => {
      expect((mockSocket as any).emit).toHaveBeenCalledWith('heartbeat', expect.objectContaining({
        timestamp: expect.any(Number)
      }));
    });

    it('should stop heartbeat on disconnect', () => {
      wsManager.disconnect();
      
      // Heartbeat should be stopped
      expect(wsManager.getConnectionStatus()).toBe('disconnected');
    });
  });

  describe('Status Information', () => {
    it('should provide accurate connection status', () => {
      expect(wsManager.getConnectionStatus()).toBe('disconnected');
      expect(wsManager.isConnected()).toBe(false);
      expect(wsManager.isAuth()).toBe(false);
      expect(wsManager.getReconnectionAttempts()).toBe(0);
    });

    it('should provide rate limit information', () => {
      const rateLimitInfo = wsManager.getRateLimitInfo();
      expect(rateLimitInfo).toHaveProperty('messageCount');
      expect(rateLimitInfo).toHaveProperty('resetTime');
      expect(rateLimitInfo.messageCount).toBe(0);
    });
  });
});
