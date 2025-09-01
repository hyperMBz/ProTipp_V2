/**
 * Performance Monitoring
 * Valós idejű teljesítmény metrikák gyűjtése és alerting
 */

export interface PerformanceMetrics {
  id: string;
  metric_type: 'response_time' | 'throughput' | 'error_rate' | 'memory_usage';
  value: number;
  unit: string;
  timestamp: Date;
  endpoint?: string;
  user_id?: string;
  session_id?: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  metric: PerformanceMetrics;
  threshold: number;
  timestamp: Date;
  resolved?: boolean;
}

export interface MonitoringConfig {
  enableRealTimeMonitoring: boolean;
  alertThresholds: {
    responseTime: number; // ms
    errorRate: number; // percentage
    memoryUsage: number; // MB
    throughput: number; // requests per second
  };
  samplingRate: number; // percentage
  retentionPeriod: number; // days
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private config: MonitoringConfig;
  private isMonitoring: boolean = false;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      alertThresholds: {
        responseTime: 1000, // 1 másodperc
        errorRate: 5, // 5%
        memoryUsage: 512, // 512 MB
        throughput: 100, // 100 req/s
      },
      samplingRate: 100, // 100%
      retentionPeriod: 30, // 30 nap
      ...config,
    };
  }

  static getInstance(config?: Partial<MonitoringConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Monitoring indítása
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.startMetricsCollection();
    this.startAlertingSystem();

    console.log('Performance monitoring started');
  }

  /**
   * Monitoring leállítása
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  /**
   * Metrika rögzítése
   */
  recordMetric(metric: Omit<PerformanceMetrics, 'id' | 'timestamp'>): void {
    if (!this.isMonitoring) return;

    const fullMetric: PerformanceMetrics = {
      ...metric,
      id: this.generateMetricId(),
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);
    this.checkAlertThresholds(fullMetric);
    this.cleanupOldMetrics();
  }

  /**
   * API response time mérés
   */
  async measureApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>,
    userId?: string,
    sessionId?: string
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const responseTime = performance.now() - startTime;

      this.recordMetric({
        metric_type: 'response_time',
        value: responseTime,
        unit: 'ms',
        endpoint,
        user_id: userId,
        session_id: sessionId,
      });

      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;

      this.recordMetric({
        metric_type: 'error_rate',
        value: 1,
        unit: 'count',
        endpoint,
        user_id: userId,
        session_id: sessionId,
      });

      this.recordMetric({
        metric_type: 'response_time',
        value: responseTime,
        unit: 'ms',
        endpoint,
        user_id: userId,
        session_id: sessionId,
      });

      throw error;
    }
  }

  /**
   * Throughput mérés
   */
  recordThroughput(endpoint: string, requestsPerSecond: number): void {
    this.recordMetric({
      metric_type: 'throughput',
      value: requestsPerSecond,
      unit: 'req/s',
      endpoint,
    });
  }

  /**
   * Memory usage mérés
   */
  recordMemoryUsage(memoryMB: number): void {
    this.recordMetric({
      metric_type: 'memory_usage',
      value: memoryMB,
      unit: 'MB',
    });
  }

  /**
   * Teljesítmény metrikák lekérése
   */
  getMetrics(
    filters?: {
      type?: PerformanceMetrics['metric_type'];
      endpoint?: string;
      timeRange?: { start: Date; end: Date };
    }
  ): PerformanceMetrics[] {
    let filteredMetrics = [...this.metrics];

    if (filters?.type) {
      filteredMetrics = filteredMetrics.filter(m => m.metric_type === filters.type);
    }

    if (filters?.endpoint) {
      filteredMetrics = filteredMetrics.filter(m => m.endpoint === filters.endpoint);
    }

    if (filters?.timeRange) {
      filteredMetrics = filteredMetrics.filter(
        m => m.timestamp >= filters.timeRange!.start && m.timestamp <= filters.timeRange!.end
      );
    }

    return filteredMetrics;
  }

  /**
   * Teljesítmény statisztikák
   */
  getPerformanceStats(timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Utolsó 24 óra
    end: new Date()
  }): {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    averageThroughput: number;
    peakMemoryUsage: number;
  } {
    const metrics = this.getMetrics({ timeRange });
    
    const responseTimeMetrics = metrics.filter(m => m.metric_type === 'response_time');
    const errorMetrics = metrics.filter(m => m.metric_type === 'error_rate');
    const throughputMetrics = metrics.filter(m => m.metric_type === 'throughput');
    const memoryMetrics = metrics.filter(m => m.metric_type === 'memory_usage');

    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0;

    const totalRequests = responseTimeMetrics.length;
    const totalErrors = errorMetrics.reduce((sum, m) => sum + m.value, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    const averageThroughput = throughputMetrics.length > 0
      ? throughputMetrics.reduce((sum, m) => sum + m.value, 0) / throughputMetrics.length
      : 0;

    const peakMemoryUsage = memoryMetrics.length > 0
      ? Math.max(...memoryMetrics.map(m => m.value))
      : 0;

    return {
      averageResponseTime,
      totalRequests,
      errorRate,
      averageThroughput,
      peakMemoryUsage,
    };
  }

  /**
   * Alert-ek lekérése
   */
  getAlerts(resolved: boolean = false): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.resolved === resolved);
  }

  /**
   * Alert feloldása
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Teljesítmény riport generálása
   */
  generatePerformanceReport(): {
    summary: any;
    trends: any;
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const stats = this.getPerformanceStats();
    const recentAlerts = this.getAlerts(false);
    
    const recommendations: string[] = [];
    
    if (stats.averageResponseTime > this.config.alertThresholds.responseTime) {
      recommendations.push('API response time optimization needed');
    }
    
    if (stats.errorRate > this.config.alertThresholds.errorRate) {
      recommendations.push('Error rate investigation required');
    }
    
    if (stats.peakMemoryUsage > this.config.alertThresholds.memoryUsage) {
      recommendations.push('Memory usage optimization needed');
    }

    return {
      summary: stats,
      trends: this.calculateTrends(),
      alerts: recentAlerts,
      recommendations,
    };
  }

  /**
   * Performance observers beállítása
   */
  private setupPerformanceObservers(): void {
    // Web Vitals monitoring
    if (typeof window !== 'undefined') {
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.recordMetric({
              metric_type: 'response_time',
              value: lastEntry.startTime,
              unit: 'ms',
              endpoint: 'lcp',
            });
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.error('LCP observer setup failed:', error);
        }
      }

      // FID (First Input Delay)
      if ('PerformanceObserver' in window) {
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                             this.recordMetric({
                 metric_type: 'response_time',
                 value: (entry as any).processingStart - entry.startTime,
                 unit: 'ms',
                 endpoint: 'fid',
               });
            });
          });
          
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.error('FID observer setup failed:', error);
        }
      }
    }
  }

  /**
   * Metrikák gyűjtésének indítása
   */
  private startMetricsCollection(): void {
    // Memory usage monitoring
    setInterval(() => {
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        const memoryMB = memory.usedJSHeapSize / (1024 * 1024);
        this.recordMemoryUsage(memoryMB);
      }
    }, 30000); // 30 másodpercenként

    // Throughput monitoring
    let requestCount = 0;
    setInterval(() => {
      const requestsPerSecond = requestCount;
      requestCount = 0;
      this.recordThroughput('api', requestsPerSecond);
    }, 1000); // 1 másodpercenként
  }

  /**
   * Alerting rendszer indítása
   */
  private startAlertingSystem(): void {
    setInterval(() => {
      const stats = this.getPerformanceStats();
      
      // Response time alert
      if (stats.averageResponseTime > this.config.alertThresholds.responseTime) {
        this.createAlert('warning', 'High response time detected', {
          id: this.generateMetricId(),
          metric_type: 'response_time',
          value: stats.averageResponseTime,
          unit: 'ms',
          timestamp: new Date(),
        }, this.config.alertThresholds.responseTime);
      }

      // Error rate alert
      if (stats.errorRate > this.config.alertThresholds.errorRate) {
        this.createAlert('error', 'High error rate detected', {
          id: this.generateMetricId(),
          metric_type: 'error_rate',
          value: stats.errorRate,
          unit: '%',
          timestamp: new Date(),
        }, this.config.alertThresholds.errorRate);
      }

      // Memory usage alert
      if (stats.peakMemoryUsage > this.config.alertThresholds.memoryUsage) {
        this.createAlert('warning', 'High memory usage detected', {
          id: this.generateMetricId(),
          metric_type: 'memory_usage',
          value: stats.peakMemoryUsage,
          unit: 'MB',
          timestamp: new Date(),
        }, this.config.alertThresholds.memoryUsage);
      }
    }, 60000); // 1 percenként
  }

  /**
   * Alert küszöbértékek ellenőrzése
   */
  private checkAlertThresholds(metric: PerformanceMetrics): void {
    const thresholds = this.config.alertThresholds;

    switch (metric.metric_type) {
      case 'response_time':
        if (metric.value > thresholds.responseTime) {
          this.createAlert('warning', 'Slow response time', metric, thresholds.responseTime);
        }
        break;
      case 'error_rate':
        if (metric.value > thresholds.errorRate) {
          this.createAlert('error', 'High error rate', metric, thresholds.errorRate);
        }
        break;
      case 'memory_usage':
        if (metric.value > thresholds.memoryUsage) {
          this.createAlert('warning', 'High memory usage', metric, thresholds.memoryUsage);
        }
        break;
      case 'throughput':
        if (metric.value < thresholds.throughput) {
          this.createAlert('warning', 'Low throughput', metric, thresholds.throughput);
        }
        break;
    }
  }

  /**
   * Alert létrehozása
   */
  private createAlert(
    type: PerformanceAlert['type'],
    message: string,
    metric: PerformanceMetrics,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      id: this.generateAlertId(),
      type,
      message,
      metric,
      threshold,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);
    console.warn(`Performance Alert [${type.toUpperCase()}]: ${message}`);
  }

  /**
   * Régi metrikák tisztítása
   */
  private cleanupOldMetrics(): void {
    const cutoffDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffDate);
  }

  /**
   * Trend számítások
   */
  private calculateTrends(): any {
    // Egyszerű trend számítás az utolsó 1 órához képest
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentStats = this.getPerformanceStats({ start: oneHourAgo, end: now });
    const previousStats = this.getPerformanceStats({ 
      start: new Date(oneHourAgo.getTime() - 60 * 60 * 1000), 
      end: oneHourAgo 
    });

    return {
      responseTimeChange: recentStats.averageResponseTime - previousStats.averageResponseTime,
      errorRateChange: recentStats.errorRate - previousStats.errorRate,
      throughputChange: recentStats.averageThroughput - previousStats.averageThroughput,
    };
  }

  /**
   * Segédfüggvények
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton export
export const performanceMonitor = PerformanceMonitor.getInstance();
