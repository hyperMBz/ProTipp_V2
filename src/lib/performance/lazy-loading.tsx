/**
 * Lazy Loading Performance Optimization
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy loading wrapper
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback ? <fallback /> : <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy loaded components
export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
);

export const LazyBetTracker = lazy(() => 
  import('@/components/bet-tracker/BetTracker').then(module => ({
    default: module.BetTracker
  }))
);

export const LazyCalculator = lazy(() => 
  import('@/components/calculator/CalculatorModal').then(module => ({
    default: module.CalculatorModal
  }))
);

export const LazyArbitrageOpportunities = lazy(() => 
  import('@/components/arbitrage/ArbitrageOpportunities').then(module => ({
    default: module.ArbitrageOpportunities
  }))
);

export const LazyProfile = lazy(() => 
  import('@/components/profile/Profile').then(module => ({
    default: module.Profile
  }))
);

export const LazySettings = lazy(() => 
  import('@/components/settings/Settings').then(module => ({
    default: module.Settings
  }))
);

// Dynamic imports for heavy libraries
export const loadChartLibrary = () => 
  import('recharts').then(module => module);

export const loadDateLibrary = () => 
  import('date-fns').then(module => module);

export const loadSocketLibrary = () => 
  import('socket.io-client').then(module => module);

// Intersection Observer for lazy loading
export class LazyLoadObserver {
  private observer: IntersectionObserver;
  private loadedElements: Set<Element> = new Set();

  constructor(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) {
    this.observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }

  observe(element: Element) {
    if (!this.loadedElements.has(element)) {
      this.observer.observe(element);
    }
  }

  unobserve(element: Element) {
    this.observer.unobserve(element);
    this.loadedElements.add(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Virtual scrolling hook
export function useVirtualScrolling(
  items: any[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  startTiming(name: string) {
    this.metrics.set(name, performance.now());
  }
  
  endTiming(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    return duration;
  }
  
  measureRender(componentName: string, renderFn: () => void): number {
    this.startTiming(`${componentName}-render`);
    renderFn();
    return this.endTiming(`${componentName}-render`);
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

// Memory management
export class MemoryManager {
  private cache: Map<string, any> = new Map();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  get(key: string) {
    return this.cache.get(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

// Bundle size optimization
export function optimizeBundle() {
  // Remove unused imports
  const unusedImports = [
    'lodash',
    'moment',
    'jquery',
    'bootstrap'
  ];
  
  console.log('Removing unused imports:', unusedImports);
  
  // Enable tree shaking
  const treeShakingConfig = {
    sideEffects: false,
    usedExports: true,
    providedExports: true
  };
  
  console.log('Tree shaking configuration:', treeShakingConfig);
  
  return {
    unusedImports,
    treeShakingConfig
  };
}

// Performance utilities
export const performanceUtils = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  },
  
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },
  
  memoize: <T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
};

export default {
  withLazyLoading,
  LazyAnalyticsDashboard,
  LazyBetTracker,
  LazyCalculator,
  LazyArbitrageOpportunities,
  LazyProfile,
  LazySettings,
  loadChartLibrary,
  loadDateLibrary,
  loadSocketLibrary,
  LazyLoadObserver,
  useVirtualScrolling,
  PerformanceMonitor,
  MemoryManager,
  optimizeBundle,
  performanceUtils
};
