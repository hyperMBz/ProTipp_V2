"use client";

import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  navigationStart: number | null;
}

interface PerformanceEntry {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationId: string;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    navigationStart: null,
  });

  const [isSupported, setIsSupported] = useState(false);

  const updateMetrics = useCallback((entry: PerformanceEntry) => {
    setMetrics(prev => ({
      ...prev,
      [entry.name]: entry.value,
    }));
  }, []);

  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    setIsSupported(true);

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        ttfb: navigation.responseStart - navigation.requestStart,
        navigationStart: navigation.fetchStart,
      }));
    }

    // Observe performance entries
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            updateMetrics({
              name: 'fcp',
              value: entry.startTime,
              delta: entry.startTime,
              id: entry.name,
              navigationId: '0',
            });
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          updateMetrics({
            name: 'lcp',
            value: entry.startTime,
            delta: entry.startTime,
            id: entry.name,
            navigationId: '0',
          });
        } else if (entry.entryType === 'first-input') {
          const firstInput = entry as PerformanceEventTiming;
          updateMetrics({
            name: 'fid',
            value: firstInput.processingStart - firstInput.startTime,
            delta: firstInput.processingStart - firstInput.startTime,
            id: entry.name,
            navigationId: '0',
          });
        } else if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as any; // PerformanceEntry;
          if (!layoutShift.hadRecentInput) {
            setMetrics(prev => ({
              ...prev,
              cls: (prev.cls || 0) + layoutShift.value,
            }));
          }
        }
      }
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, [updateMetrics]);

  const getPerformanceScore = useCallback((metric: keyof PerformanceMetrics): number => {
    const value = metrics[metric];
    if (value === null) return 0;

    switch (metric) {
      case 'fcp':
        if (value <= 1800) return 100;
        if (value <= 3000) return 90;
        if (value <= 4000) return 50;
        return 0;
      
      case 'lcp':
        if (value <= 2500) return 100;
        if (value <= 4000) return 90;
        if (value <= 6000) return 50;
        return 0;
      
      case 'fid':
        if (value <= 100) return 100;
        if (value <= 300) return 90;
        if (value <= 500) return 50;
        return 0;
      
      case 'cls':
        if (value <= 0.1) return 100;
        if (value <= 0.25) return 90;
        if (value <= 0.4) return 50;
        return 0;
      
      case 'ttfb':
        if (value <= 800) return 100;
        if (value <= 1800) return 90;
        if (value <= 3000) return 50;
        return 0;
      
      default:
        return 0;
    }
  }, [metrics]);

  const getOverallScore = useCallback((): number => {
    const scores = [
      getPerformanceScore('fcp'),
      getPerformanceScore('lcp'),
      getPerformanceScore('fid'),
      getPerformanceScore('cls'),
      getPerformanceScore('ttfb'),
    ].filter(score => score > 0);

    if (scores.length === 0) return 0;
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [getPerformanceScore]);

  const getPerformanceGrade = useCallback((score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, []);

  useEffect(() => {
    const cleanup = measurePerformance();
    return cleanup;
  }, [measurePerformance]);

  return {
    metrics,
    isSupported,
    getPerformanceScore,
    getOverallScore,
    getPerformanceGrade,
    measurePerformance,
  };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setRenderTime(duration);
      setRenderCount(prev => prev + 1);
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  });

  return {
    renderTime,
    renderCount,
    isSlowRender: renderTime !== null && renderTime > 16,
  };
}

// Hook for measuring API call performance
export function useApiPerformance() {
  const [apiMetrics, setApiMetrics] = useState<Record<string, {
    duration: number;
    timestamp: number;
    success: boolean;
  }>>({});

  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setApiMetrics(prev => ({
        ...prev,
        [endpoint]: {
          duration,
          timestamp: Date.now(),
          success: true,
        },
      }));
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setApiMetrics(prev => ({
        ...prev,
        [endpoint]: {
          duration,
          timestamp: Date.now(),
          success: false,
        },
      }));
      
      throw error;
    }
  }, []);

  const getAverageApiTime = useCallback((endpoint?: string): number => {
    const metrics = endpoint ? { [endpoint]: apiMetrics[endpoint] } : apiMetrics;
    const values = Object.values(metrics).filter(m => m.success);
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, m) => sum + m.duration, 0) / values.length;
  }, [apiMetrics]);

  const getApiSuccessRate = useCallback((endpoint?: string): number => {
    const metrics = endpoint ? { [endpoint]: apiMetrics[endpoint] } : apiMetrics;
    const total = Object.keys(metrics).length;
    
    if (total === 0) return 0;
    
    const successful = Object.values(metrics).filter(m => m.success).length;
    return (successful / total) * 100;
  }, [apiMetrics]);

  return {
    apiMetrics,
    measureApiCall,
    getAverageApiTime,
    getApiSuccessRate,
  };
}