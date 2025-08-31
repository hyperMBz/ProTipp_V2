"use client";

import { AdvancedArbitrageOpportunity } from './ml-detector';

// Performance Optimization Interfaces
export interface OptimizationConfig {
  cacheEnabled: boolean;
  cacheTTL: number; // Time to live in milliseconds
  parallelProcessing: boolean;
  maxConcurrentTasks: number;
  memoryLimit: number; // MB
  batchSize: number;
  enableCompression: boolean;
  enableDeduplication: boolean;
}

export interface PerformanceMetrics {
  processingTime: number; // milliseconds
  memoryUsage: number; // MB
  cacheHitRate: number; // 0-1
  throughput: number; // opportunities per second
  cpuUsage: number; // 0-1
  optimizationScore: number; // 0-1
  bottlenecks: string[];
  recommendations: string[];
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  size: number; // bytes
}

export interface BatchResult<T> {
  results: T[];
  processingTime: number;
  successCount: number;
  errorCount: number;
  errors: Error[];
}

// Performance Optimizer Engine
export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;
  private processingQueue: Array<() => Promise<any>> = [];
  private activeTasks = 0;
  private memoryUsage = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(config?: Partial<OptimizationConfig>) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      parallelProcessing: true,
      maxConcurrentTasks: 4,
      memoryLimit: 100, // 100 MB
      batchSize: 50,
      enableCompression: true,
      enableDeduplication: true,
      ...config
    };

    this.metrics = this.initializeMetrics();
    this.startCleanupInterval();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      processingTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      throughput: 0,
      cpuUsage: 0,
      optimizationScore: 0,
      bottlenecks: [],
      recommendations: []
    };
  }

  // Main optimization method for arbitrage opportunities
  public async optimizeArbitrageProcessing(
    opportunities: any[],
    processor: (opp: any) => Promise<AdvancedArbitrageOpportunity>
  ): Promise<AdvancedArbitrageOpportunity[]> {
    const startTime = performance.now();
    
    try {
      // Deduplicate opportunities if enabled
      const deduplicatedOpportunities = this.config.enableDeduplication 
        ? this.deduplicateOpportunities(opportunities)
        : opportunities;

      // Process in batches if parallel processing is enabled
      let results: AdvancedArbitrageOpportunity[];
      
      if (this.config.parallelProcessing) {
        results = await this.processBatchParallel(deduplicatedOpportunities, processor);
      } else {
        results = await this.processBatchSequential(deduplicatedOpportunities, processor);
      }

      // Update metrics
      const endTime = performance.now();
      this.updateMetrics(endTime - startTime, opportunities.length, results.length);

      return results;
    } catch (error) {
      console.error('Optimization error:', error);
      throw error;
    }
  }

  // Cache management
  public async getCachedResult<T>(key: string): Promise<T | null> {
    if (!this.config.cacheEnabled) return null;

    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheMisses++;
      return null;
    }

    // Update access count and return data
    entry.accessCount++;
    this.cacheHits++;
    return entry.data;
  }

  public async setCachedResult<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.config.cacheEnabled) return;

    // Check memory limit
    const dataSize = this.estimateDataSize(data);
    if (this.memoryUsage + dataSize > this.config.memoryLimit * 1024 * 1024) {
      this.evictCacheEntries();
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL,
      accessCount: 0,
      size: dataSize
    };

    this.cache.set(key, entry);
    this.memoryUsage += dataSize;
  }

  // Batch processing
  private async processBatchParallel<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const batches = this.createBatches(items, this.config.batchSize);
    const batchPromises = batches.map(batch => this.processBatch(batch, processor));
    
    const batchResults = await Promise.all(batchPromises);
    return batchResults.flat();
  }

  private async processBatchSequential<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const batches = this.createBatches(items, this.config.batchSize);
    const results: R[] = [];
    
    for (const batch of batches) {
      const batchResult = await this.processBatch(batch, processor);
      results.push(...batchResult);
    }
    
    return results;
  }

  private async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    const errors: Error[] = [];

    // Process items with concurrency control
    const semaphore = new Semaphore(this.config.maxConcurrentTasks);
    
    const promises = items.map(async (item) => {
      await semaphore.acquire();
      try {
        const result = await processor(item);
        results.push(result);
      } catch (error) {
        errors.push(error as Error);
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);

    if (errors.length > 0) {
      console.warn(`Batch processing completed with ${errors.length} errors:`, errors);
    }

    return results;
  }

  // Deduplication
  private deduplicateOpportunities(opportunities: any[]): any[] {
    const seen = new Set<string>();
    const deduplicated: any[] = [];

    for (const opportunity of opportunities) {
      const key = this.generateOpportunityKey(opportunity);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(opportunity);
      }
    }

    return deduplicated;
  }

  private generateOpportunityKey(opportunity: any): string {
    // Generate a unique key for deduplication
    return `${opportunity.sport}_${opportunity.event}_${opportunity.bet1?.bookmaker}_${opportunity.bet2?.bookmaker}`;
  }

  // Memory management
  private evictCacheEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count (least accessed first) and timestamp (oldest first)
    entries.sort((a, b) => {
      const aScore = a[1].accessCount * 0.7 + (Date.now() - a[1].timestamp) * 0.3;
      const bScore = b[1].accessCount * 0.7 + (Date.now() - b[1].timestamp) * 0.3;
      return aScore - bScore;
    });

    // Remove entries until we're under the memory limit
    const targetMemory = this.config.memoryLimit * 1024 * 1024 * 0.8; // 80% of limit
    
    for (const [key, entry] of entries) {
      if (this.memoryUsage <= targetMemory) break;
      
      this.cache.delete(key);
      this.memoryUsage -= entry.size;
    }
  }

  private estimateDataSize(data: any): number {
    // Rough estimation of data size in bytes
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }

  // Utility methods
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private updateMetrics(processingTime: number, inputCount: number, outputCount: number): void {
    this.metrics.processingTime = processingTime;
    this.metrics.memoryUsage = this.memoryUsage / (1024 * 1024); // Convert to MB
    this.metrics.cacheHitRate = this.cacheHits / (this.cacheHits + this.cacheMisses) || 0;
    this.metrics.throughput = (outputCount / processingTime) * 1000; // per second
    
    // Calculate optimization score
    this.metrics.optimizationScore = this.calculateOptimizationScore();
    
    // Identify bottlenecks
    this.metrics.bottlenecks = this.identifyBottlenecks();
    
    // Generate recommendations
    this.metrics.recommendations = this.generateRecommendations();
  }

  private calculateOptimizationScore(): number {
    let score = 0;
    
    // Cache hit rate contribution (30%)
    score += this.metrics.cacheHitRate * 0.3;
    
    // Throughput contribution (25%)
    const throughputScore = Math.min(this.metrics.throughput / 100, 1); // Normalize to 0-1
    score += throughputScore * 0.25;
    
    // Memory efficiency contribution (20%)
    const memoryEfficiency = Math.max(0, 1 - (this.metrics.memoryUsage / this.config.memoryLimit));
    score += memoryEfficiency * 0.2;
    
    // Processing time efficiency contribution (25%)
    const timeEfficiency = Math.max(0, 1 - (this.metrics.processingTime / 1000)); // Normalize to 0-1
    score += timeEfficiency * 0.25;
    
    return Math.min(Math.max(score, 0), 1);
  }

  private identifyBottlenecks(): string[] {
    const bottlenecks: string[] = [];
    
    if (this.metrics.cacheHitRate < 0.5) {
      bottlenecks.push('Low cache hit rate - consider increasing cache size or TTL');
    }
    
    if (this.metrics.throughput < 50) {
      bottlenecks.push('Low throughput - consider enabling parallel processing or increasing batch size');
    }
    
    if (this.metrics.memoryUsage > this.config.memoryLimit * 0.9) {
      bottlenecks.push('High memory usage - consider reducing cache size or enabling compression');
    }
    
    if (this.metrics.processingTime > 1000) {
      bottlenecks.push('Slow processing time - consider optimizing algorithms or increasing concurrency');
    }
    
    return bottlenecks;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.cacheHitRate < 0.3) {
      recommendations.push('Increase cache TTL to improve hit rate');
    }
    
    if (this.metrics.throughput < 30) {
      recommendations.push('Enable parallel processing for better throughput');
    }
    
    if (this.metrics.memoryUsage > this.config.memoryLimit * 0.8) {
      recommendations.push('Reduce cache size or enable compression');
    }
    
    if (!this.config.enableDeduplication) {
      recommendations.push('Enable deduplication to reduce processing load');
    }
    
    if (this.config.maxConcurrentTasks < 4) {
      recommendations.push('Increase max concurrent tasks for better parallelism');
    }
    
    return recommendations;
  }

  // Cache cleanup
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Clean up every minute
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= entry.size;
        this.cache.delete(key);
      }
    }
  }

  // Configuration management
  public updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  // Metrics access
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Cache statistics
  public getCacheStats(): {
    size: number;
    memoryUsage: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    return {
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      hitRate: this.metrics.cacheHitRate,
      totalHits: this.cacheHits,
      totalMisses: this.cacheMisses
    };
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
    this.memoryUsage = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // Reset metrics
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

// Semaphore for concurrency control
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      resolve();
    } else {
      this.permits++;
    }
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();
