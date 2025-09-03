"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { performanceMonitor, PerformanceMetrics, PerformanceAlert } from '../performance/monitoring';
import { cacheManager, CacheStats } from '../performance/cache-manager';

export interface PerformanceData {
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cacheHitRate: number;
  activeAlerts: number;
  isLoading: boolean;
  lastUpdate: Date | null;
}

export interface PerformanceChartData {
  timestamp: Date;
  value: number;
  label: string;
}

/**
 * Hook for monitoring overall performance
 */
export function usePerformance(refreshInterval: number = 30000) {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    avgResponseTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    activeAlerts: 0,
    isLoading: true,
    lastUpdate: null,
  });

  const refreshPerformanceData = useCallback(async () => {
    try {
      const summary = performanceMonitor.getCurrentPerformanceSummary();
      
      setPerformanceData({
        ...summary,
        isLoading: false,
        lastUpdate: new Date(),
      });
    } catch (error) {
      console.error('[usePerformance] Error refreshing performance data:', error);
      setPerformanceData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshPerformanceData();

    // Setup refresh interval
    const interval = setInterval(refreshPerformanceData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshPerformanceData, refreshInterval]);

  return {
    ...performanceData,
    refresh: refreshPerformanceData,
  };
}

/**
 * Hook for monitoring specific metrics
 */
export function useMetrics(
  metricType: string,
  period: 'hour' | 'day' | 'week' = 'hour',
  refreshInterval: number = 60000
) {
  const [metrics, setMetrics] = useState<PerformanceChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMetrics = useCallback(async () => {
    try {
      const aggregatedMetrics = performanceMonitor.getAggregatedMetrics(metricType, period);
      
      const chartData: PerformanceChartData[] = aggregatedMetrics.map(metric => ({
        timestamp: metric.timestamp,
        value: metric.avg,
        label: metric.timestamp.toLocaleTimeString(),
      }));

      setMetrics(chartData);
      setIsLoading(false);
    } catch (error) {
      console.error('[useMetrics] Error refreshing metrics:', error);
      setIsLoading(false);
    }
  }, [metricType, period]);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshMetrics, refreshInterval]);

  const stats = useMemo(() => {
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      latest: values[values.length - 1],
      trend: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0,
    };
  }, [metrics]);

  return {
    metrics,
    stats,
    isLoading,
    refresh: refreshMetrics,
  };
}

/**
 * Hook for monitoring alerts
 */
export function useAlerts(refreshInterval: number = 10000) {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAlerts = useCallback(async () => {
    try {
      const activeAlerts = performanceMonitor.getActiveAlerts();
      setAlerts(activeAlerts);
      setIsLoading(false);
    } catch (error) {
      console.error('[useAlerts] Error refreshing alerts:', error);
      setIsLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      performanceMonitor.resolveAlert(alertId);
      await refreshAlerts();
    } catch (error) {
      console.error('[useAlerts] Error resolving alert:', error);
    }
  }, [refreshAlerts]);

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, refreshInterval);
    
    // Listen for new alerts
    const handleAlert = () => refreshAlerts();
    window.addEventListener('performance:alert', handleAlert);

    return () => {
      clearInterval(interval);
      window.removeEventListener('performance:alert', handleAlert);
    };
  }, [refreshAlerts, refreshInterval]);

  const alertsByType = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      acc[alert.metric_type] = (acc[alert.metric_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [alerts]);

  const alertsBySeverity = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [alerts]);

  return {
    alerts,
    alertsByType,
    alertsBySeverity,
    isLoading,
    refresh: refreshAlerts,
    resolveAlert,
  };
}

/**
 * Hook for monitoring cache performance
 */
export function useCacheStats(refreshInterval: number = 30000) {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    total_keys: 0,
    total_size: 0,
    hit_rate: 0,
    miss_rate: 0,
    evictions: 0,
    memory_usage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshCacheStats = useCallback(async () => {
    try {
      const stats = cacheManager.getStats();
      setCacheStats(stats);
      setIsLoading(false);

      // Record cache hit rate metric
      performanceMonitor.recordCacheHitRate(stats.hit_rate, 'memory');
    } catch (error) {
      console.error('[useCacheStats] Error refreshing cache stats:', error);
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await cacheManager.clear();
      await refreshCacheStats();
    } catch (error) {
      console.error('[useCacheStats] Error clearing cache:', error);
    }
  }, [refreshCacheStats]);

  useEffect(() => {
    refreshCacheStats();
    const interval = setInterval(refreshCacheStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshCacheStats, refreshInterval]);

  const cacheHealth = useMemo(() => {
    if (cacheStats.hit_rate >= 0.8) return 'excellent';
    if (cacheStats.hit_rate >= 0.6) return 'good';
    if (cacheStats.hit_rate >= 0.4) return 'fair';
    return 'poor';
  }, [cacheStats.hit_rate]);

  return {
    stats: cacheStats,
    health: cacheHealth,
    isLoading,
    refresh: refreshCacheStats,
    clearCache,
  };
}

/**
 * Hook for measuring component performance
 */
export function useComponentPerformance(componentName: string) {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);

  const measureRender = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setRenderTime(duration);
      setRenderCount(prev => prev + 1);
      
      // Record the metric
      performanceMonitor.recordMetric({
        metric_type: 'response_time',
        value: duration,
        unit: 'ms',
        endpoint: componentName,
        tags: { type: 'component_render' },
      });
    };
  }, [componentName]);

  const resetStats = useCallback(() => {
    setRenderTime(0);
    setRenderCount(0);
  }, []);

  return {
    renderTime,
    renderCount,
    measureRender,
    resetStats,
  };
}

/**
 * Hook for API performance monitoring
 */
export function useApiPerformance() {
  const recordApiCall = useCallback((
    endpoint: string,
    method: string,
    responseTime: number,
    status: number,
    userId?: string
  ) => {
    // Record response time
    performanceMonitor.recordApiResponseTime(endpoint, responseTime, userId);

    // Record error if status indicates failure
    if (status >= 400) {
      performanceMonitor.recordError(endpoint, `HTTP_${status}`, userId);
    }

    // Record throughput
    performanceMonitor.recordMetric({
      metric_type: 'throughput',
      value: 1,
      unit: 'requests',
      endpoint,
      user_id: userId,
      tags: { method, status: status.toString() },
    });
  }, []);

  const wrapApiCall = useCallback(<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET',
    userId?: string
  ) => {
    return async (): Promise<T> => {
      const startTime = performance.now();
      let status = 200;

      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        status = error.status || 500;
        throw error;
      } finally {
        const responseTime = performance.now() - startTime;
        recordApiCall(endpoint, method, responseTime, status, userId);
      }
    };
  }, [recordApiCall]);

  return {
    recordApiCall,
    wrapApiCall,
  };
}

/**
 * Hook for real-time performance monitoring
 */
export function useRealTimePerformance(enabled: boolean = true) {
  const [isMonitoring, setIsMonitoring] = useState(enabled);

  useEffect(() => {
    if (!isMonitoring || typeof window === 'undefined') return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const monitor = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;

      // Monitor frame rate (should be ~16.67ms for 60fps)
      if (frameTime > 33) { // More than 2 frames
        performanceMonitor.recordMetric({
          metric_type: 'response_time',
          value: frameTime,
          unit: 'ms',
          tags: { type: 'frame_time' },
        });
      }

      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(monitor);
    };

    animationFrameId = requestAnimationFrame(monitor);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMonitoring]);

  return {
    isMonitoring,
    start: () => setIsMonitoring(true),
    stop: () => setIsMonitoring(false),
  };
}

/**
 * Hook for performance budget monitoring
 */
export function usePerformanceBudget(budgets: {
  maxResponseTime?: number;
  maxMemoryUsage?: number;
  minCacheHitRate?: number;
  maxErrorRate?: number;
}) {
  const performance = usePerformance();
  
  const budgetStatus = useMemo(() => {
    const status = {
      responseTime: budgets.maxResponseTime 
        ? performance.avgResponseTime <= budgets.maxResponseTime
        : true,
      memoryUsage: budgets.maxMemoryUsage
        ? performance.memoryUsage <= budgets.maxMemoryUsage
        : true,
      cacheHitRate: budgets.minCacheHitRate
        ? performance.cacheHitRate >= budgets.minCacheHitRate
        : true,
      errorRate: budgets.maxErrorRate
        ? performance.errorRate <= budgets.maxErrorRate
        : true,
    };

    const violations = Object.entries(status)
      .filter(([, passed]) => !passed)
      .map(([metric]) => metric);

    return {
      ...status,
      violations,
      isWithinBudget: violations.length === 0,
    };
  }, [performance, budgets]);

  return {
    ...budgetStatus,
    performance,
  };
}
