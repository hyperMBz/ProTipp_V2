/**
 * Performance Hooks
 * Teljesítmény monitorozás és cache státusz kezelés React hook-okkal
 */

import { useState, useEffect, useCallback } from 'react';
import { performanceMonitor, PerformanceMetrics, PerformanceAlert } from '../performance/monitoring';
import { cacheManager, CacheStats } from '../performance/cache-manager';
import { queryOptimizer } from '../performance/query-optimizer';
import { cdnManager, CDNStats } from '../performance/cdn-manager';
import { loadBalancer, LoadBalancerStats } from '../performance/load-balancer';

export interface PerformanceState {
  isMonitoring: boolean;
  metrics: PerformanceMetrics[];
  alerts: PerformanceAlert[];
  cacheStats: CacheStats;
  cdnStats: CDNStats;
  loadBalancerStats: LoadBalancerStats;
  queryStats: {
    averageResponseTime: number;
    slowQueries: any[];
    topQueries: any[];
  };
  performanceStats: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    averageThroughput: number;
    peakMemoryUsage: number;
  };
}

export interface PerformanceActions {
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearCache: (pattern?: string) => Promise<void>;
  resolveAlert: (alertId: string) => void;
  getPerformanceReport: () => any;
}

/**
 * Hook a teljesítmény monitorozáshoz
 */
export function usePerformance(): [PerformanceState, PerformanceActions] {
  const [state, setState] = useState<PerformanceState>({
    isMonitoring: false,
    metrics: [],
    alerts: [],
    cacheStats: {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0,
    },
    cdnStats: {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      bandwidthSaved: 0,
      errors: 0,
    },
    loadBalancerStats: {
      totalRequests: 0,
      activeConnections: 0,
      averageResponseTime: 0,
      errorRate: 0,
      serverCount: 0,
      healthyServers: 0,
      autoScalingEvents: 0,
    },
    queryStats: {
      averageResponseTime: 0,
      slowQueries: [],
      topQueries: [],
    },
    performanceStats: {
      averageResponseTime: 0,
      totalRequests: 0,
      errorRate: 0,
      averageThroughput: 0,
      peakMemoryUsage: 0,
    },
  });

  // Monitoring indítása
  const startMonitoring = useCallback(() => {
    performanceMonitor.startMonitoring();
    setState(prev => ({ ...prev, isMonitoring: true }));
  }, []);

  // Monitoring leállítása
  const stopMonitoring = useCallback(() => {
    performanceMonitor.stopMonitoring();
    setState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  // Cache törlése
  const clearCache = useCallback(async (pattern?: string) => {
    await cacheManager.clear(pattern);
    updateCacheStats();
  }, []);

  // Alert feloldása
  const resolveAlert = useCallback((alertId: string) => {
    performanceMonitor.resolveAlert(alertId);
    updateAlerts();
  }, []);

  // Teljesítmény riport generálása
  const getPerformanceReport = useCallback(() => {
    return performanceMonitor.generatePerformanceReport();
  }, []);

  // Cache statisztikák frissítése
  const updateCacheStats = useCallback(() => {
    const stats = cacheManager.getStats();
    setState(prev => ({ ...prev, cacheStats: stats }));
  }, []);

  // CDN statisztikák frissítése
  const updateCDNStats = useCallback(() => {
    const stats = cdnManager.getStats();
    setState(prev => ({ ...prev, cdnStats: stats }));
  }, []);

  // Load Balancer statisztikák frissítése
  const updateLoadBalancerStats = useCallback(() => {
    const stats = loadBalancer.getStats();
    setState(prev => ({ ...prev, loadBalancerStats: stats }));
  }, []);

  // Query statisztikák frissítése
  const updateQueryStats = useCallback(() => {
    const stats = queryOptimizer.getCacheStats();
    const metrics = queryOptimizer.getPerformanceMetrics();
    
    setState(prev => ({
      ...prev,
      queryStats: {
        averageResponseTime: metrics.averageResponseTime,
        slowQueries: metrics.slowQueries,
        topQueries: metrics.topQueries,
      },
    }));
  }, []);

  // Alert-ek frissítése
  const updateAlerts = useCallback(() => {
    const alerts = performanceMonitor.getAlerts(false);
    setState(prev => ({ ...prev, alerts }));
  }, []);

  // Teljesítmény statisztikák frissítése
  const updatePerformanceStats = useCallback(() => {
    const stats = performanceMonitor.getPerformanceStats();
    setState(prev => ({ ...prev, performanceStats: stats }));
  }, []);

  // Metrikák frissítése
  const updateMetrics = useCallback(() => {
    const metrics = performanceMonitor.getMetrics();
    setState(prev => ({ ...prev, metrics }));
  }, []);

  // Periodikus frissítések
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    // Cache statisztikák frissítése 5 másodpercenként
    intervals.push(setInterval(updateCacheStats, 5000));

    // CDN statisztikák frissítése 10 másodpercenként
    intervals.push(setInterval(updateCDNStats, 10000));

    // Load Balancer statisztikák frissítése 15 másodpercenként
    intervals.push(setInterval(updateLoadBalancerStats, 15000));

    // Query statisztikák frissítése 10 másodpercenként
    intervals.push(setInterval(updateQueryStats, 10000));

    // Alert-ek frissítése 30 másodpercenként
    intervals.push(setInterval(updateAlerts, 30000));

    // Teljesítmény statisztikák frissítése 1 percenként
    intervals.push(setInterval(updatePerformanceStats, 60000));

    // Metrikák frissítése 2 percenként
    intervals.push(setInterval(updateMetrics, 120000));

    // Kezdeti frissítések
    updateCacheStats();
    updateCDNStats();
    updateLoadBalancerStats();
    updateQueryStats();
    updateAlerts();
    updatePerformanceStats();
    updateMetrics();

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [updateCacheStats, updateCDNStats, updateLoadBalancerStats, updateQueryStats, updateAlerts, updatePerformanceStats, updateMetrics]);

  const actions: PerformanceActions = {
    startMonitoring,
    stopMonitoring,
    clearCache,
    resolveAlert,
    getPerformanceReport,
  };

  return [state, actions];
}

/**
 * Hook a cache státusz monitorozásához
 */
export function useCacheStatus() {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = cacheManager.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Cache stats refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async (pattern?: string) => {
    setIsLoading(true);
    try {
      await cacheManager.clear(pattern);
      await refreshStats();
    } catch (error) {
      console.error('Cache clear failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  const warmCache = useCallback(async <T>(
    keys: string[],
    dataProvider: (key: string) => Promise<T>,
    options?: any
  ) => {
    setIsLoading(true);
    try {
      await cacheManager.warmCache(keys, dataProvider, options);
      await refreshStats();
    } catch (error) {
      console.error('Cache warming failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  useEffect(() => {
    refreshStats();
    
    const interval = setInterval(refreshStats, 10000); // 10 másodpercenként
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    cacheStats,
    isLoading,
    refreshStats,
    clearCache,
    warmCache,
  };
}

/**
 * Hook a teljesítmény alert-ek monitorozásához
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeAlerts = performanceMonitor.getAlerts(false);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Alerts refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    setIsLoading(true);
    try {
      performanceMonitor.resolveAlert(alertId);
      await refreshAlerts();
    } catch (error) {
      console.error('Alert resolve failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAlerts]);

  const getAlertCount = useCallback((type?: PerformanceAlert['type']) => {
    if (type) {
      return alerts.filter(alert => alert.type === type).length;
    }
    return alerts.length;
  }, [alerts]);

  useEffect(() => {
    refreshAlerts();
    
    const interval = setInterval(refreshAlerts, 30000); // 30 másodpercenként
    
    return () => clearInterval(interval);
  }, [refreshAlerts]);

  return {
    alerts,
    isLoading,
    refreshAlerts,
    resolveAlert,
    getAlertCount,
  };
}

/**
 * Hook a teljesítmény metrikák monitorozásához
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMetrics = useCallback(async (filters?: any) => {
    setIsLoading(true);
    try {
      const currentMetrics = performanceMonitor.getMetrics(filters);
      setMetrics(currentMetrics);
    } catch (error) {
      console.error('Metrics refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMetricsByType = useCallback((type: PerformanceMetrics['metric_type']) => {
    return metrics.filter(metric => metric.metric_type === type);
  }, [metrics]);

  const getMetricsByEndpoint = useCallback((endpoint: string) => {
    return metrics.filter(metric => metric.endpoint === endpoint);
  }, [metrics]);

  const getAverageMetric = useCallback((type: PerformanceMetrics['metric_type']) => {
    const typeMetrics = getMetricsByType(type);
    if (typeMetrics.length === 0) return 0;
    
    return typeMetrics.reduce((sum, metric) => sum + metric.value, 0) / typeMetrics.length;
  }, [getMetricsByType]);

  useEffect(() => {
    refreshMetrics();
    
    const interval = setInterval(() => refreshMetrics(), 60000); // 1 percenként
    
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    metrics,
    isLoading,
    refreshMetrics,
    getMetricsByType,
    getMetricsByEndpoint,
    getAverageMetric,
  };
}

/**
 * Hook a teljesítmény riport generálásához
 */
export function usePerformanceReport() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const performanceReport = performanceMonitor.generatePerformanceReport();
      setReport(performanceReport);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return {
    report,
    isLoading,
    generateReport,
  };
}

/**
 * Hook a CDN kezeléshez
 */
export function useCDN() {
  const [cdnStats, setCdnStats] = useState<CDNStats>({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    bandwidthSaved: 0,
    errors: 0,
  });

  const [healthStatus, setHealthStatus] = useState<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errors: string[];
  }>({
    status: 'healthy',
    responseTime: 0,
    errors: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = cdnManager.getStats();
      setCdnStats(stats);
    } catch (error) {
      console.error('CDN stats refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const health = await cdnManager.healthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('CDN health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const preloadAsset = useCallback((path: string, type: 'image' | 'font' | 'script' | 'style') => {
    cdnManager.preloadAsset(path, type);
  }, []);

  const getOptimizedImageUrl = useCallback((
    path: string,
    width?: number,
    height?: number,
    quality: number = 80,
    format: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp'
  ) => {
    return cdnManager.getOptimizedImageUrl(path, width, height, quality, format);
  }, []);

  useEffect(() => {
    refreshStats();
    checkHealth();
    
    const interval = setInterval(refreshStats, 30000); // 30 másodpercenként
    
    return () => clearInterval(interval);
  }, [refreshStats, checkHealth]);

  return {
    cdnStats,
    healthStatus,
    isLoading,
    refreshStats,
    checkHealth,
    preloadAsset,
    getOptimizedImageUrl,
  };
}

/**
 * Hook a Load Balancer kezeléshez
 */
export function useLoadBalancer() {
  const [loadBalancerStats, setLoadBalancerStats] = useState<LoadBalancerStats>({
    totalRequests: 0,
    activeConnections: 0,
    averageResponseTime: 0,
    errorRate: 0,
    serverCount: 0,
    healthyServers: 0,
    autoScalingEvents: 0,
  });

  const [serverStatuses, setServerStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = loadBalancer.getStats();
      const statuses = loadBalancer.getServerStatuses();
      setLoadBalancerStats(stats);
      setServerStatuses(statuses);
    } catch (error) {
      console.error('Load balancer stats refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const routeRequest = useCallback(async <T>(
    requestFn: (serverUrl: string) => Promise<T>,
    options?: {
      retries?: number;
      timeout?: number;
      fallback?: boolean;
    }
  ): Promise<T> => {
    return loadBalancer.routeRequest(requestFn, options);
  }, []);

  useEffect(() => {
    refreshStats();
    
    const interval = setInterval(refreshStats, 15000); // 15 másodpercenként
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    loadBalancerStats,
    serverStatuses,
    isLoading,
    refreshStats,
    routeRequest,
  };
}
