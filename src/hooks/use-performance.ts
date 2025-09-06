/**
 * Performance Monitoring Hook
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { PerformanceMonitor, MemoryManager } from '@/lib/performance/lazy-loading';

export function usePerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    loadTime: 0
  });
  
  const monitorRef = useRef(new PerformanceMonitor());
  const memoryManagerRef = useRef(new MemoryManager());
  
  // Measure render time
  const measureRender = useCallback((componentName: string, renderFn: () => void) => {
    const renderTime = monitorRef.current.measureRender(componentName, renderFn);
    setMetrics(prev => ({ ...prev, renderTime }));
    return renderTime;
  }, []);
  
  // Measure memory usage
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
      return memoryUsage;
    }
    return 0;
  }, []);
  
  // Measure load time
  const measureLoadTime = useCallback(() => {
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));
    return loadTime;
  }, []);
  
  // Measure bundle size
  const measureBundleSize = useCallback(() => {
    // This would typically be done at build time
    // For now, we'll estimate based on loaded modules
    const bundleSize = document.querySelectorAll('script').length * 50; // KB
    setMetrics(prev => ({ ...prev, bundleSize }));
    return bundleSize;
  }, []);
  
  // Performance monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      measureMemory();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [measureMemory]);
  
  // Initial measurements
  useEffect(() => {
    measureLoadTime();
    measureBundleSize();
  }, [measureLoadTime, measureBundleSize]);
  
  return {
    metrics,
    measureRender,
    measureMemory,
    measureLoadTime,
    measureBundleSize,
    monitor: monitorRef.current,
    memoryManager: memoryManagerRef.current
  };
}

export function useRenderPerformance(componentName: string) {
  const [renderTime, setRenderTime] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  
  const measureRender = useCallback((renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const duration = end - start;
    
    setRenderTime(duration);
    setRenderCount(prev => prev + 1);
    
    return duration;
  }, []);
  
  return {
    renderTime,
    renderCount,
    measureRender
  };
}

export function useMemoryUsage() {
  const [memoryUsage, setMemoryUsage] = useState({
    used: 0,
    total: 0,
    limit: 0
  });
  
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryUsage({
        used: memory.usedJSHeapSize / 1024 / 1024, // MB
        total: memory.totalJSHeapSize / 1024 / 1024, // MB
        limit: memory.jsHeapSizeLimit / 1024 / 1024 // MB
      });
    }
  }, []);
  
  useEffect(() => {
    measureMemory();
    const interval = setInterval(measureMemory, 1000);
    return () => clearInterval(interval);
  }, [measureMemory]);
  
  return {
    memoryUsage,
    measureMemory
  };
}

export function useBundleSize() {
  const [bundleSize, setBundleSize] = useState(0);
  
  const measureBundleSize = useCallback(() => {
    // Estimate bundle size based on loaded resources
    const scripts = document.querySelectorAll('script[src]');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('_next/static')) {
        totalSize += 50; // Estimate 50KB per script
      }
    });
    
    stylesheets.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('_next/static')) {
        totalSize += 10; // Estimate 10KB per stylesheet
      }
    });
    
    setBundleSize(totalSize);
    return totalSize;
  }, []);
  
  useEffect(() => {
    measureBundleSize();
  }, [measureBundleSize]);
  
  return {
    bundleSize,
    measureBundleSize
  };
}

export function useLoadTime() {
  const [loadTime, setLoadTime] = useState(0);
  
  const measureLoadTime = useCallback(() => {
    const loadTime = performance.now();
    setLoadTime(loadTime);
    return loadTime;
  }, []);
  
  useEffect(() => {
    measureLoadTime();
  }, [measureLoadTime]);
  
  return {
    loadTime,
    measureLoadTime
  };
}

export function usePerformanceOptimization() {
  const [optimizations, setOptimizations] = useState<string[]>([]);
  
  const checkOptimizations = useCallback(() => {
    const suggestions: string[] = [];
    
    // Check for large bundle size
    const scripts = document.querySelectorAll('script[src]');
    if (scripts.length > 10) {
      suggestions.push('Consider code splitting to reduce bundle size');
    }
    
    // Check for memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (memoryUsage > 0.8) {
        suggestions.push('High memory usage detected, consider optimizing components');
      }
    }
    
    // Check for render performance
    const renderTime = performance.now();
    if (renderTime > 100) {
      suggestions.push('Slow render time detected, consider using React.memo');
    }
    
    setOptimizations(suggestions);
  }, []);
  
  useEffect(() => {
    checkOptimizations();
    const interval = setInterval(checkOptimizations, 10000);
    return () => clearInterval(interval);
  }, [checkOptimizations]);
  
  return {
    optimizations,
    checkOptimizations
  };
}

export default {
  usePerformance,
  useRenderPerformance,
  useMemoryUsage,
  useBundleSize,
  useLoadTime,
  usePerformanceOptimization
};
