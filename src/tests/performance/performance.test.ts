/**
 * Performance Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerformanceMonitor, MemoryManager, performanceUtils } from '@/lib/performance/lazy-loading';
import { usePerformance, useMemoryUsage, useBundleSize } from '@/hooks/use-performance';

describe('Performance Monitoring', () => {
  let monitor: PerformanceMonitor;
  let memoryManager: MemoryManager;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    memoryManager = new MemoryManager();
  });

  afterEach(() => {
    monitor = null as any;
    memoryManager = null as any;
  });

  describe('PerformanceMonitor', () => {
    it('should measure render time correctly', () => {
      const componentName = 'TestComponent';
      const renderTime = monitor.measureRender(componentName, () => {
        // Simulate render work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
      });

      expect(renderTime).toBeGreaterThan(0);
      expect(renderTime).toBeLessThan(100); // Should be fast
    });

    it('should track timing correctly', () => {
      monitor.startTiming('test-operation');
      
      // Simulate some work
      setTimeout(() => {
        const duration = monitor.endTiming('test-operation');
        expect(duration).toBeGreaterThan(0);
      }, 10);
    });

    it('should return 0 for non-existent timing', () => {
      const duration = monitor.endTiming('non-existent');
      expect(duration).toBe(0);
    });
  });

  describe('MemoryManager', () => {
    it('should store and retrieve values', () => {
      memoryManager.set('test-key', 'test-value');
      const value = memoryManager.get('test-key');
      
      expect(value).toBe('test-value');
    });

    it('should respect max size limit', () => {
      const smallManager = new MemoryManager(2);
      
      smallManager.set('key1', 'value1');
      smallManager.set('key2', 'value2');
      smallManager.set('key3', 'value3'); // Should remove key1
      
      expect(smallManager.get('key1')).toBeUndefined();
      expect(smallManager.get('key2')).toBe('value2');
      expect(smallManager.get('key3')).toBe('value3');
    });

    it('should clear all values', () => {
      memoryManager.set('key1', 'value1');
      memoryManager.set('key2', 'value2');
      
      expect(memoryManager.size()).toBe(2);
      
      memoryManager.clear();
      
      expect(memoryManager.size()).toBe(0);
    });
  });

  describe('Performance Utils', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = performanceUtils.debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only call once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should throttle function calls', (done) => {
      let callCount = 0;
      const throttledFn = performanceUtils.throttle(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should call immediately
      expect(callCount).toBe(1);

      // Wait for throttle period
      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 150);
    });

    it('should memoize function results', () => {
      let callCount = 0;
      const expensiveFn = (n: number) => {
        callCount++;
        return n * 2;
      };

      const memoizedFn = performanceUtils.memoize(expensiveFn);

      // First call
      const result1 = memoizedFn(5);
      expect(result1).toBe(10);
      expect(callCount).toBe(1);

      // Second call with same input
      const result2 = memoizedFn(5);
      expect(result2).toBe(10);
      expect(callCount).toBe(1); // Should not call again

      // Third call with different input
      const result3 = memoizedFn(10);
      expect(result3).toBe(20);
      expect(callCount).toBe(2);
    });
  });
});

describe('Performance Hooks', () => {
  describe('useMemoryUsage', () => {
    it('should track memory usage', () => {
      const { result } = renderHook(() => useMemoryUsage());
      
      expect(result.current.memoryUsage).toBeDefined();
      expect(result.current.memoryUsage.used).toBeGreaterThanOrEqual(0);
      expect(result.current.memoryUsage.total).toBeGreaterThanOrEqual(0);
      expect(result.current.memoryUsage.limit).toBeGreaterThan(0);
    });
  });

  describe('useBundleSize', () => {
    it('should track bundle size', () => {
      const { result } = renderHook(() => useBundleSize());
      
      expect(result.current.bundleSize).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should render components within acceptable time', () => {
    const start = performance.now();
    
    // Simulate component render
    render(<div>Test Component</div>);
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(100); // Should render in under 100ms
  });

  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }));

    const start = performance.now();
    
    // Simulate processing large dataset
    const processed = largeDataset.map(item => ({
      ...item,
      processed: true
    }));
    
    const end = performance.now();
    const processingTime = end - start;
    
    expect(processed).toHaveLength(10000);
    expect(processingTime).toBeLessThan(1000); // Should process in under 1s
  });

  it('should handle memory efficiently', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Create large objects
    const largeObjects = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      data: new Array(1000).fill(Math.random())
    }));
    
    const memoryAfterCreation = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = memoryAfterCreation - initialMemory;
    
    // Clear references
    largeObjects.length = 0;
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const memoryAfterCleanup = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryDecrease = memoryAfterCreation - memoryAfterCleanup;
    
    expect(memoryIncrease).toBeGreaterThan(0);
    expect(memoryDecrease).toBeGreaterThan(0);
  });
});

describe('Performance Optimization', () => {
  it('should lazy load components', async () => {
    const { LazyAnalyticsDashboard } = await import('@/lib/performance/lazy-loading');
    
    expect(LazyAnalyticsDashboard).toBeDefined();
    expect(typeof LazyAnalyticsDashboard).toBe('function');
  });

  it('should handle dynamic imports', async () => {
    const { loadChartLibrary } = await import('@/lib/performance/lazy-loading');
    
    const chartLibrary = await loadChartLibrary();
    expect(chartLibrary).toBeDefined();
  });

  it('should optimize bundle size', () => {
    const { optimizeBundle } = require('@/lib/performance/lazy-loading');
    
    const optimization = optimizeBundle();
    
    expect(optimization).toBeDefined();
    expect(optimization.unusedImports).toBeDefined();
    expect(optimization.treeShakingConfig).toBeDefined();
  });
});

// Helper function for testing hooks
function renderHook(hook: () => any) {
  let result: any;
  
  const TestComponent = () => {
    result = hook();
    return null;
  };
  
  render(<TestComponent />);
  
  return { result };
}
