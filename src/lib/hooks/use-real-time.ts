// Real-time React Hooks for Connection Management and Data Updates
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ConnectionManager, { type ConnectionStatus } from '../api/real-time/connection-manager';
import WebSocketManager from '../api/real-time/websocket';
import SSEManager from '../api/real-time/sse';
import PollingFallback from '../api/real-time/fallback';

interface UseRealTimeConfig {
  websocketUrl?: string;
  sseUrl?: string;
  authToken?: string;
  preferredMethod?: 'websocket' | 'sse' | 'polling';
  autoConnect?: boolean;
  enablePolling?: boolean;
}

interface RealTimeState {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  currentMethod: string;
  latency: number;
  error: string | null;
  isConnecting: boolean;
}

interface UseRealTimeReturn extends RealTimeState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchMethod: (method: 'websocket' | 'sse' | 'polling') => Promise<boolean>;
  sendMessage: (event: string, data: unknown) => boolean;
  refreshConnection: () => Promise<void>;
}

// Global connection manager instance
const globalConnectionManager: ConnectionManager | null = null;

export function useRealTime(config: UseRealTimeConfig = {}): UseRealTimeReturn {
  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    connectionStatus: {
      method: 'none',
      status: 'disconnected',
      latency: 0,
      lastUpdate: null,
      isHealthy: false,
    },
    currentMethod: 'none',
    latency: 0,
    error: null,
    isConnecting: false,
  });

  const queryClient = useQueryClient();
  const connectionManagerRef = useRef<ConnectionManager | null>(null);
  const isInitializedRef = useRef(false);

  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => ({
    websocketUrl: config.websocketUrl,
    authToken: config.authToken,
    enablePolling: config.enablePolling,
    preferredMethod: config.preferredMethod || 'websocket',
    autoConnect: config.autoConnect !== false
  }), [config.websocketUrl, config.authToken, config.enablePolling, config.preferredMethod, config.autoConnect]);

  // Initialize connection manager
  const initializeConnectionManager = useCallback(() => {
    if (connectionManagerRef.current || isInitializedRef.current) return;

    const connectionConfig = {
      websocket: memoizedConfig.websocketUrl ? {
        url: memoizedConfig.websocketUrl,
        authToken: memoizedConfig.authToken,
        rateLimitPerMinute: 100,
      } : undefined,
      sse: config.sseUrl ? {
        url: config.sseUrl,
        authToken: config.authToken,
        timeout: 30000,
      } : undefined,
      polling: memoizedConfig.enablePolling ? {
        interval: 5000,
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffInterval: 60000,
      } : undefined,
      preferredMethod: memoizedConfig.preferredMethod,
      fallbackOrder: ['websocket', 'sse', 'polling'] as ('websocket' | 'sse' | 'polling')[],
      healthCheckInterval: 30000,
      autoReconnect: true,
    };

    connectionManagerRef.current = new ConnectionManager(connectionConfig);
    isInitializedRef.current = true;
  }, [memoizedConfig, config.sseUrl, config.authToken]);

  // Set up event handlers for connection manager
  const setupEventHandlers = useCallback(() => {
    if (!connectionManagerRef.current) return;

    const manager = connectionManagerRef.current;

    // Connection status updates
    manager.on('connection_status', (data: unknown) => {
      const status = data as ConnectionStatus;
      setState(prev => ({
        ...prev,
        isConnected: status.status === 'connected',
        connectionStatus: status,
        currentMethod: status.method,
        latency: status.latency,
        error: status.errorMessage || null,
        isConnecting: status.status === 'connecting',
      }));
    });

    // Health check updates
    manager.on('health_check', (data: unknown) => {
      const healthData = data as { isHealthy: boolean; method: string };
      setState(prev => ({
        ...prev,
        connectionStatus: {
          ...prev.connectionStatus,
          isHealthy: healthData.isHealthy,
        },
      }));
    });

    // Odds updates - invalidate relevant queries
    manager.on('odds_update', (data: unknown) => {
      const oddsData = data as { bookmaker_id: string; event_id: string; market: string; outcome: string; odds: number; timestamp: Date };
      // Invalidate odds-related queries
      queryClient.invalidateQueries({ queryKey: ['odds'] });
      queryClient.invalidateQueries({ queryKey: ['arbitrage'] });
      
      // Update specific odds data if needed
      queryClient.setQueryData(['odds', oddsData.bookmaker_id, oddsData.event_id], (oldData: unknown) => {
        if (oldData) {
          return {
            ...oldData,
            ...oddsData,
            lastUpdate: new Date(),
          };
        }
        return oddsData;
      });
    });

    // Bookmaker status updates
    manager.on('bookmaker_status_update', (data: unknown) => {
      const statusData = data as { bookmakerId: string; status: ConnectionStatus };
      queryClient.setQueryData(['bookmaker-status', statusData.bookmakerId], statusData.status);
    });
  }, [queryClient]);

  // Connect to real-time service
  const connect = useCallback(async () => {
    if (!connectionManagerRef.current) {
      initializeConnectionManager();
      // Set up event handlers after initialization
      setupEventHandlers();
    }

    if (connectionManagerRef.current) {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      try {
        await connectionManagerRef.current.connect();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Connection failed',
          isConnecting: false,
        }));
      }
    }
  }, [initializeConnectionManager, setupEventHandlers]);

  // Disconnect from real-time service
  const disconnect = useCallback(() => {
    if (connectionManagerRef.current) {
      connectionManagerRef.current.disconnect();
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionStatus: {
          method: 'none',
          status: 'disconnected',
          latency: 0,
          lastUpdate: null,
          isHealthy: false,
        },
      }));
    }
  }, []);

  // Switch connection method
  const switchMethod = useCallback(async (method: 'websocket' | 'sse' | 'polling'): Promise<boolean> => {
    if (!connectionManagerRef.current) return false;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      const success = await connectionManagerRef.current.switchMethod(method);
      if (!success) {
        setState(prev => ({
          ...prev,
          error: `Failed to switch to ${method}`,
          isConnecting: false,
        }));
      }
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Method switch failed',
        isConnecting: false,
      }));
      return false;
    }
  }, []);

  // Send message through current connection
  const sendMessage = useCallback((event: string, data: unknown): boolean => {
    if (!connectionManagerRef.current) return false;

    // This would need to be implemented based on the current connection method
    // For now, we'll return false as the connection manager doesn't expose send methods
    return false;
  }, []);

  // Refresh connection
  const refreshConnection = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await connect();
  }, [connect, disconnect]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (memoizedConfig.autoConnect) {
      initializeConnectionManager();
      setupEventHandlers();
      connect();
    }

    return () => {
      // Cleanup on unmount
      if (connectionManagerRef.current) {
        connectionManagerRef.current.disconnect();
      }
    };
  }, [memoizedConfig.autoConnect, initializeConnectionManager, setupEventHandlers, connect]);

  return {
    ...state,
    connect,
    disconnect,
    switchMethod,
    sendMessage,
    refreshConnection,
  };
}

// Hook for connection status only
export function useConnectionStatus(config: UseRealTimeConfig = {}): ConnectionStatus {
  const { connectionStatus } = useRealTime(config);
  return connectionStatus;
}

// Hook for real-time odds updates
export function useRealTimeOdds(config: UseRealTimeConfig = {}) {
  const [oddsUpdates, setOddsUpdates] = useState<{ bookmaker_id: string; event_id: string; market: string; outcome: string; odds: number; timestamp: Date }[]>([]);
  const connectionManagerRef = useRef<ConnectionManager | null>(null);

  useEffect(() => {
    if (!connectionManagerRef.current) {
      const connectionConfig = {
        websocket: config.websocketUrl ? {
          url: config.websocketUrl,
          authToken: config.authToken,
        } : undefined,
        preferredMethod: config.preferredMethod || 'websocket',
        autoReconnect: true,
      };

      connectionManagerRef.current = new ConnectionManager(connectionConfig);
    }

    const manager = connectionManagerRef.current;

    // Listen for odds updates
    const handleOddsUpdate = (data: unknown) => {
      const oddsData = data as { bookmaker_id: string; event_id: string; market: string; outcome: string; odds: number; timestamp: Date };
      setOddsUpdates(prev => [...prev.slice(-99), oddsData]); // Keep last 100 updates
    };

    manager.on('odds_update', handleOddsUpdate);

    // Connect if auto-connect is enabled
    if (config.autoConnect !== false) {
      manager.connect();
    }

    return () => {
      manager.off('odds_update', handleOddsUpdate);
      manager.disconnect();
    };
  }, [config]);

  return {
    oddsUpdates,
    clearUpdates: () => setOddsUpdates([]),
  };
}

// Hook for latency monitoring
export function useLatencyMonitoring(config: UseRealTimeConfig = {}) {
  const [latency, setLatency] = useState<number>(0);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const connectionManagerRef = useRef<ConnectionManager | null>(null);

  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => ({
    websocketUrl: config.websocketUrl,
    authToken: config.authToken,
    preferredMethod: config.preferredMethod || 'websocket',
    autoConnect: config.autoConnect !== false
  }), [config.websocketUrl, config.authToken, config.preferredMethod, config.autoConnect]);

  useEffect(() => {
    if (!connectionManagerRef.current) {
      const connectionConfig = {
        websocket: memoizedConfig.websocketUrl ? {
          url: memoizedConfig.websocketUrl,
          authToken: memoizedConfig.authToken,
        } : undefined,
        preferredMethod: memoizedConfig.preferredMethod,
        autoReconnect: true,
      };

      connectionManagerRef.current = new ConnectionManager(connectionConfig);
    }

    const manager = connectionManagerRef.current;

    // Monitor connection status for latency updates
    const handleConnectionStatus = (data: unknown) => {
      const status = data as ConnectionStatus;
      setLatency(status.latency);
      setLatencyHistory(prev => [...prev.slice(-99), status.latency]); // Keep last 100 measurements
    };

    manager.on('connection_status', handleConnectionStatus);

    if (memoizedConfig.autoConnect) {
      manager.connect();
    }

    return () => {
      manager.off('connection_status', handleConnectionStatus);
      manager.disconnect();
    };
  }, [memoizedConfig]);

  return {
    currentLatency: latency,
    latencyHistory,
    averageLatency: latencyHistory.length > 0 
      ? latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length 
      : 0,
    clearHistory: () => setLatencyHistory([]),
  };
}

// Hook for bookmaker-specific connection status
export function useBookmakerConnection(bookmakerId: string, config: UseRealTimeConfig = {}) {
  const [bookmakerStatus, setBookmakerStatus] = useState<ConnectionStatus | null>(null);
  const connectionManagerRef = useRef<ConnectionManager | null>(null);

  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => ({
    websocketUrl: config.websocketUrl,
    authToken: config.authToken,
    preferredMethod: config.preferredMethod || 'websocket',
    autoConnect: config.autoConnect !== false
  }), [config.websocketUrl, config.authToken, config.preferredMethod, config.autoConnect]);

  useEffect(() => {
    if (!connectionManagerRef.current) {
      const connectionConfig = {
        websocket: memoizedConfig.websocketUrl ? {
          url: memoizedConfig.websocketUrl,
          authToken: memoizedConfig.authToken,
        } : undefined,
        preferredMethod: memoizedConfig.preferredMethod,
        autoReconnect: true,
      };

      connectionManagerRef.current = new ConnectionManager(connectionConfig);
    }

    const manager = connectionManagerRef.current;

    // Listen for bookmaker-specific status updates
    const handleBookmakerStatus = (data: unknown) => {
      const statusData = data as { bookmakerId: string; status: ConnectionStatus };
      if (statusData.bookmakerId === bookmakerId) {
        setBookmakerStatus(statusData.status);
      }
    };

    manager.on('bookmaker_status_update', handleBookmakerStatus);

    if (memoizedConfig.autoConnect) {
      manager.connect();
    }

    return () => {
      manager.off('bookmaker_status_update', handleBookmakerStatus);
      manager.disconnect();
    };
  }, [bookmakerId, memoizedConfig]);

  return {
    bookmakerStatus,
    isConnected: bookmakerStatus?.status === 'connected',
    isHealthy: bookmakerStatus?.isHealthy || false,
  };
}
