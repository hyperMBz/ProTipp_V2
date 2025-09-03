"use client";

export interface PerformanceMetrics {
  id: string;
  metric_type: 'response_time' | 'throughput' | 'error_rate' | 'memory_usage' | 'cpu_usage' | 'cache_hit_rate';
  value: number;
  unit: string;
  timestamp: Date;
  endpoint?: string;
  user_id?: string;
  session_id?: string;
  tags?: Record<string, string>;
}

export interface AlertRule {
  id: string;
  metric_type: string;
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  duration: number; // seconds
  enabled: boolean;
  notification_channels: string[];
}

export interface PerformanceAlert {
  id: string;
  rule_id: string;
  metric_type: string;
  current_value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  resolved_at?: Date;
}

/**
 * Performance Monitoring System
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private alertRules: AlertRule[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.setupDefaultAlertRules();
    this.setupPerformanceObservers();
    this.startMetricsCollection();
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetrics, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetrics = {
      ...metric,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);
    
    // Keep only last 10000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000);
    }

    // Check alert rules
    this.checkAlertRules(fullMetric);

    // Log critical metrics
    if (this.isCriticalMetric(fullMetric)) {
      console.warn('[PerformanceMonitor] Critical metric recorded:', fullMetric);
    }
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(endpoint: string, responseTime: number, userId?: string): void {
    this.recordMetric({
      metric_type: 'response_time',
      value: responseTime,
      unit: 'ms',
      endpoint,
      user_id: userId,
      tags: { type: 'api' },
    });
  }

  /**
   * Record page load time
   */
  recordPageLoadTime(page: string, loadTime: number, userId?: string): void {
    this.recordMetric({
      metric_type: 'response_time',
      value: loadTime,
      unit: 'ms',
      endpoint: page,
      user_id: userId,
      tags: { type: 'page_load' },
    });
  }

  /**
   * Record error rate
   */
  recordError(endpoint: string, errorType: string, userId?: string): void {
    this.recordMetric({
      metric_type: 'error_rate',
      value: 1,
      unit: 'count',
      endpoint,
      user_id: userId,
      tags: { error_type: errorType },
    });
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      
      this.recordMetric({
        metric_type: 'memory_usage',
        value: memoryInfo.usedJSHeapSize,
        unit: 'bytes',
        tags: { type: 'heap_used' },
      });

      this.recordMetric({
        metric_type: 'memory_usage',
        value: memoryInfo.totalJSHeapSize,
        unit: 'bytes',
        tags: { type: 'heap_total' },
      });
    }
  }

  /**
   * Record cache hit rate
   */
  recordCacheHitRate(hitRate: number, cacheType: string): void {
    this.recordMetric({
      metric_type: 'cache_hit_rate',
      value: hitRate * 100,
      unit: 'percentage',
      tags: { cache_type: cacheType },
    });
  }

  /**
   * Get metrics by type and time range
   */
  getMetrics(
    metricType?: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 1000
  ): PerformanceMetrics[] {
    let filteredMetrics = this.metrics;

    if (metricType) {
      filteredMetrics = filteredMetrics.filter(m => m.metric_type === metricType);
    }

    if (startTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= startTime);
    }

    if (endTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= endTime);
    }

    return filteredMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(
    metricType: string,
    period: 'hour' | 'day' | 'week' = 'hour'
  ): Array<{
    timestamp: Date;
    avg: number;
    min: number;
    max: number;
    count: number;
  }> {
    const now = new Date();
    const periodMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    }[period];

    const startTime = new Date(now.getTime() - periodMs);
    const metrics = this.getMetrics(metricType, startTime);

    // Group by time buckets (5-minute intervals)
    const bucketSize = 5 * 60 * 1000; // 5 minutes
    const buckets = new Map<number, PerformanceMetrics[]>();

    metrics.forEach(metric => {
      const bucketTime = Math.floor(metric.timestamp.getTime() / bucketSize) * bucketSize;
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      buckets.get(bucketTime)!.push(metric);
    });

    // Calculate aggregations
    return Array.from(buckets.entries())
      .map(([bucketTime, bucketMetrics]) => {
        const values = bucketMetrics.map(m => m.value);
        return {
          timestamp: new Date(bucketTime),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get current performance summary
   */
  getCurrentPerformanceSummary(): {
    avgResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cacheHitRate: number;
    activeAlerts: number;
  } {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const recentMetrics = this.getMetrics(undefined, lastHour);

    // Calculate averages
    const responseTimes = recentMetrics
      .filter(m => m.metric_type === 'response_time')
      .map(m => m.value);

    const errorCounts = recentMetrics
      .filter(m => m.metric_type === 'error_rate')
      .length;

    const memoryMetrics = recentMetrics
      .filter(m => m.metric_type === 'memory_usage' && m.tags?.type === 'heap_used')
      .map(m => m.value);

    const cacheHitRates = recentMetrics
      .filter(m => m.metric_type === 'cache_hit_rate')
      .map(m => m.value);

    return {
      avgResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((sum, val) => sum + val, 0) / responseTimes.length 
        : 0,
      errorRate: errorCounts / Math.max(recentMetrics.length, 1) * 100,
      memoryUsage: memoryMetrics.length > 0
        ? memoryMetrics[memoryMetrics.length - 1] / (1024 * 1024) // MB
        : 0,
      cacheHitRate: cacheHitRates.length > 0
        ? cacheHitRates.reduce((sum, val) => sum + val, 0) / cacheHitRates.length
        : 0,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
    };
  }

  /**
   * Add alert rule
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const fullRule: AlertRule = {
      ...rule,
      id: this.generateId(),
    };

    this.alertRules.push(fullRule);
    return fullRule.id;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolved_at = new Date();
    }
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    // High response time alert
    this.addAlertRule({
      metric_type: 'response_time',
      threshold: 2000, // 2 seconds
      comparison: 'gt',
      duration: 60, // 1 minute
      enabled: true,
      notification_channels: ['console', 'ui'],
    });

    // High error rate alert
    this.addAlertRule({
      metric_type: 'error_rate',
      threshold: 5, // 5% error rate
      comparison: 'gt',
      duration: 300, // 5 minutes
      enabled: true,
      notification_channels: ['console', 'ui'],
    });

    // High memory usage alert
    this.addAlertRule({
      metric_type: 'memory_usage',
      threshold: 100 * 1024 * 1024, // 100MB
      comparison: 'gt',
      duration: 180, // 3 minutes
      enabled: true,
      notification_channels: ['console'],
    });

    // Low cache hit rate alert
    this.addAlertRule({
      metric_type: 'cache_hit_rate',
      threshold: 50, // 50%
      comparison: 'lt',
      duration: 600, // 10 minutes
      enabled: true,
      notification_channels: ['console'],
    });
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    try {
      // Navigation timing observer
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordPageLoadTime(
              window.location.pathname,
              navEntry.loadEventEnd - navEntry.loadEventStart
            );
          }
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.duration > 1000) { // Only log slow resources
              this.recordMetric({
                metric_type: 'response_time',
                value: resourceEntry.duration,
                unit: 'ms',
                endpoint: resourceEntry.name,
                tags: { type: 'resource', resource_type: resourceEntry.initiatorType },
              });
            }
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);

    } catch (error) {
      console.warn('[PerformanceMonitor] Could not setup observers:', error);
    }
  }

  /**
   * Start automatic metrics collection
   */
  private startMetricsCollection(): void {
    // Collect memory usage every 30 seconds
    setInterval(() => {
      this.recordMemoryUsage();
    }, 30000);

    // Collect performance metrics every minute
    setInterval(() => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetric({
            metric_type: 'throughput',
            value: 1,
            unit: 'requests',
            tags: { type: 'page_view' },
          });
        }
      }
    }, 60000);
  }

  /**
   * Check alert rules against metric
   */
  private checkAlertRules(metric: PerformanceMetrics): void {
    this.alertRules
      .filter(rule => rule.enabled && rule.metric_type === metric.metric_type)
      .forEach(rule => {
        const shouldAlert = this.evaluateAlertCondition(metric.value, rule.threshold, rule.comparison);
        
        if (shouldAlert) {
          this.triggerAlert(rule, metric);
        }
      });
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(value: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(rule: AlertRule, metric: PerformanceMetrics): void {
    const alert: PerformanceAlert = {
      id: this.generateId(),
      rule_id: rule.id,
      metric_type: rule.metric_type,
      current_value: metric.value,
      threshold: rule.threshold,
      severity: this.calculateSeverity(metric.value, rule.threshold, rule.comparison),
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Send notifications
    rule.notification_channels.forEach(channel => {
      this.sendNotification(channel, alert);
    });
  }

  /**
   * Calculate alert severity
   */
  private calculateSeverity(value: number, threshold: number, comparison: string): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = comparison === 'gt' || comparison === 'gte' 
      ? value / threshold 
      : threshold / value;

    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Send notification
   */
  private sendNotification(channel: string, alert: PerformanceAlert): void {
    switch (channel) {
      case 'console':
        console.warn(`[PerformanceAlert] ${alert.severity.toUpperCase()}: ${alert.metric_type} = ${alert.current_value} (threshold: ${alert.threshold})`);
        break;
      case 'ui':
        // In a real implementation, this would trigger UI notifications
        window.dispatchEvent(new CustomEvent('performance:alert', { detail: alert }));
        break;
    }
  }

  /**
   * Check if metric is critical
   */
  private isCriticalMetric(metric: PerformanceMetrics): boolean {
    switch (metric.metric_type) {
      case 'response_time':
        return metric.value > 5000; // 5 seconds
      case 'error_rate':
        return metric.value > 10; // 10%
      case 'memory_usage':
        return metric.value > 200 * 1024 * 1024; // 200MB
      default:
        return false;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup old metrics and alerts
   */
  cleanup(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Remove old metrics
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    // Remove old resolved alerts
    this.alerts = this.alerts.filter(a => 
      !a.resolved || (a.resolved_at && a.resolved_at > cutoffTime)
    );
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance monitoring decorator
 */
export function monitored(metricType: string = 'response_time') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = await method.apply(this, args);
        
        const endTime = performance.now();
        performanceMonitor.recordMetric({
          metric_type: metricType as any,
          value: endTime - startTime,
          unit: 'ms',
          endpoint: propertyName,
          tags: { type: 'method_call' },
        });
        
        return result;
      } catch (error) {
        performanceMonitor.recordError(propertyName, error.constructor.name);
        throw error;
      }
    };
  };
}

// Auto-cleanup every hour
setInterval(() => {
  performanceMonitor.cleanup();
}, 60 * 60 * 1000);
