"use client";

import { createClient } from '@supabase/supabase-js';

export interface CacheConfig {
  cache_key: string;
  ttl_seconds: number;
  strategy: 'memory' | 'redis' | 'cdn';
  invalidation_rules: string[];
  compression_enabled: boolean;
  version: string;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  hits: number;
  size: number;
}

export interface CacheStats {
  total_keys: number;
  total_size: number;
  hit_rate: number;
  miss_rate: number;
  evictions: number;
  memory_usage: number;
}

/**
 * Advanced Cache Manager with multiple strategies
 */
export class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  };

  constructor(
    private config: {
      maxMemorySize: number;
      defaultTTL: number;
      enableCompression: boolean;
      redisUrl?: string;
    }
  ) {
    this.setupCleanupInterval();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        memoryEntry.hits++;
        this.stats.hits++;
        return memoryEntry.value as T;
      }

      // Try Redis cache if configured
      if (this.config.redisUrl) {
        const redisValue = await this.getFromRedis<T>(key);
        if (redisValue !== null) {
          // Store in memory cache for faster access
          await this.setInMemory(key, redisValue, this.config.defaultTTL);
          this.stats.hits++;
          return redisValue;
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('[CacheManager] Get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = this.config.defaultTTL,
    strategy: 'memory' | 'redis' | 'both' = 'both'
  ): Promise<void> {
    try {
      if (strategy === 'memory' || strategy === 'both') {
        await this.setInMemory(key, value, ttl);
      }

      if ((strategy === 'redis' || strategy === 'both') && this.config.redisUrl) {
        await this.setInRedis(key, value, ttl);
      }

      this.stats.sets++;
    } catch (error) {
      console.error('[CacheManager] Set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete from memory
      this.memoryCache.delete(key);

      // Delete from Redis if configured
      if (this.config.redisUrl) {
        await this.deleteFromRedis(key);
      }

      this.stats.deletes++;
    } catch (error) {
      console.error('[CacheManager] Delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();

      if (this.config.redisUrl) {
        await this.clearRedis();
      }
    } catch (error) {
      console.error('[CacheManager] Clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalSize = Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.size, 0);

    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;

    return {
      total_keys: this.memoryCache.size,
      total_size: totalSize,
      hit_rate: hitRate,
      miss_rate: 1 - hitRate,
      evictions: this.stats.evictions,
      memory_usage: totalSize / this.config.maxMemorySize,
    };
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern);
      
      // Invalidate memory cache
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      }

      // Invalidate Redis cache if configured
      if (this.config.redisUrl) {
        await this.invalidateRedisPattern(pattern);
      }
    } catch (error) {
      console.error('[CacheManager] Invalidate pattern error:', error);
    }
  }

  /**
   * Warm cache with data
   */
  async warmCache(data: Record<string, any>, ttl?: number): Promise<void> {
    try {
      const promises = Object.entries(data).map(([key, value]) =>
        this.set(key, value, ttl)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('[CacheManager] Warm cache error:', error);
    }
  }

  /**
   * Set value in memory cache
   */
  private async setInMemory<T>(key: string, value: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: new Date(),
      ttl: ttl * 1000, // Convert to milliseconds
      hits: 0,
      size: this.calculateSize(value),
    };

    // Check memory limit
    if (this.shouldEvict(entry.size)) {
      await this.evictLRU();
    }

    this.memoryCache.set(key, entry);
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const expiry = entry.timestamp.getTime() + entry.ttl;
    return now > expiry;
  }

  /**
   * Calculate approximate size of value
   */
  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate
    } catch {
      return 1000; // Default size
    }
  }

  /**
   * Check if we should evict entries
   */
  private shouldEvict(newEntrySize: number): boolean {
    const currentSize = Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    return (currentSize + newEntrySize) > this.config.maxMemorySize;
  }

  /**
   * Evict least recently used entries
   */
  private async evictLRU(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.hits - b.hits);

    // Remove 25% of least used entries
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.memoryCache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  /**
   * Setup cleanup interval for expired entries
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (this.isExpired(entry)) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Redis operations (mock implementation for development)
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    // In production, this would use actual Redis client
    // For now, return null to indicate Redis miss
    return null;
  }

  private async setInRedis<T>(key: string, value: T, ttl: number): Promise<void> {
    // In production, this would use actual Redis client
    console.log(`[CacheManager] Would set in Redis: ${key}`);
  }

  private async deleteFromRedis(key: string): Promise<void> {
    // In production, this would use actual Redis client
    console.log(`[CacheManager] Would delete from Redis: ${key}`);
  }

  private async clearRedis(): Promise<void> {
    // In production, this would use actual Redis client
    console.log('[CacheManager] Would clear Redis cache');
  }

  private async invalidateRedisPattern(pattern: string): Promise<void> {
    // In production, this would use actual Redis client
    console.log(`[CacheManager] Would invalidate Redis pattern: ${pattern}`);
  }
}

/**
 * Global cache manager instance
 */
export const cacheManager = new CacheManager({
  maxMemorySize: 100 * 1024 * 1024, // 100MB
  defaultTTL: 300, // 5 minutes
  enableCompression: true,
  redisUrl: process.env.REDIS_URL,
});

/**
 * Cache decorator for functions
 */
export function cached(ttl: number = 300, keyPrefix: string = '') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${keyPrefix}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cacheManager.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheManager.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  constructor(private cache: CacheManager) {}

  /**
   * Warm odds data cache
   */
  async warmOddsCache(): Promise<void> {
    try {
      // This would typically fetch from database and warm cache
      console.log('[CacheWarmer] Warming odds cache...');
      
      // Mock data for development
      const mockOdds = {
        'odds:popular': { /* popular odds data */ },
        'odds:recent': { /* recent odds data */ },
        'odds:arbitrage': { /* arbitrage opportunities */ },
      };

      await this.cache.warmCache(mockOdds, 300); // 5 minutes TTL
    } catch (error) {
      console.error('[CacheWarmer] Error warming odds cache:', error);
    }
  }

  /**
   * Warm analytics cache
   */
  async warmAnalyticsCache(): Promise<void> {
    try {
      console.log('[CacheWarmer] Warming analytics cache...');
      
      const mockAnalytics = {
        'analytics:daily': { /* daily analytics */ },
        'analytics:weekly': { /* weekly analytics */ },
        'analytics:monthly': { /* monthly analytics */ },
      };

      await this.cache.warmCache(mockAnalytics, 600); // 10 minutes TTL
    } catch (error) {
      console.error('[CacheWarmer] Error warming analytics cache:', error);
    }
  }

  /**
   * Warm all caches
   */
  async warmAll(): Promise<void> {
    await Promise.all([
      this.warmOddsCache(),
      this.warmAnalyticsCache(),
    ]);
  }
}

export const cacheWarmer = new CacheWarmer(cacheManager);
