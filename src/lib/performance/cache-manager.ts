/**
 * Cache Manager
 * Redis caching rendszer odds data és számítások cache-eléséhez
 */

export interface CacheConfig {
  cache_key: string;
  ttl_seconds: number;
  strategy: 'memory' | 'redis' | 'cdn';
  invalidation_rules: string[];
  compression_enabled: boolean;
  version: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  metadata?: Record<string, any>;
}

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheItem> = new Map();
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 };
  private config: Partial<CacheConfig> = {};

  constructor() {
    this.initializeCache();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Cache inicializálása
   */
  private initializeCache(): void {
    // Memory cache cleanup interval
    setInterval(() => {
      this.cleanupExpiredItems();
    }, 60000); // 1 perc

    // Stats reset interval
    setInterval(() => {
      this.resetStats();
    }, 3600000); // 1 óra
  }

  /**
   * Adat cache-elése
   */
  async set<T>(
    key: string,
    data: T,
    options: Partial<CacheConfig> = {}
  ): Promise<void> {
    const config: CacheConfig = {
      cache_key: key,
      ttl_seconds: 300, // 5 perc alapértelmezett
      strategy: 'memory',
      invalidation_rules: [],
      compression_enabled: false,
      version: '1.0',
      ...this.config,
      ...options,
    };

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl_seconds * 1000,
      version: config.version,
      metadata: {
        strategy: config.strategy,
        compression: config.compression_enabled,
      },
    };

    // Memory cache
    if (config.strategy === 'memory') {
      this.memoryCache.set(key, cacheItem);
    }

    // Redis cache (ha elérhető)
    if (config.strategy === 'redis') {
      await this.setRedisCache(key, cacheItem, config);
    }

    // Cache méret korlátozása
    this.enforceCacheSizeLimit();
  }

  /**
   * Adat lekérése cache-ből
   */
  async get<T>(key: string, strategy: 'memory' | 'redis' | 'auto' = 'auto'): Promise<T | null> {
    try {
      let cacheItem: CacheItem<T> | null = null;

      // Memory cache ellenőrzés
      if (strategy === 'memory' || strategy === 'auto') {
        cacheItem = this.getFromMemoryCache<T>(key);
      }

      // Redis cache ellenőrzés
      if (!cacheItem && (strategy === 'redis' || strategy === 'auto')) {
        cacheItem = await this.getFromRedisCache<T>(key);
      }

      if (cacheItem) {
        // TTL ellenőrzés
        if (this.isExpired(cacheItem)) {
          await this.delete(key);
          this.stats.misses++;
          return null;
        }

        this.stats.hits++;
        return cacheItem.data;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Adat törlése cache-ből
   */
  async delete(key: string): Promise<void> {
    // Memory cache törlés
    this.memoryCache.delete(key);

    // Redis cache törlés
    try {
      await this.deleteFromRedisCache(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  /**
   * Cache törlése pattern alapján
   */
  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      // Memory cache pattern törlés
      const keysToDelete: string[] = [];
      const keys = Array.from(this.memoryCache.keys());
      for (const key of keys) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.memoryCache.delete(key));

      // Redis cache pattern törlés
      try {
        await this.clearRedisCachePattern(pattern);
      } catch (error) {
        console.error('Redis pattern clear error:', error);
      }
    } else {
      // Teljes cache törlés
      this.memoryCache.clear();
      try {
        await this.clearAllRedisCache();
      } catch (error) {
        console.error('Redis clear all error:', error);
      }
    }
  }

  /**
   * Cache statisztikák
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      size: this.memoryCache.size,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Cache warming - előre betöltés
   */
  async warmCache<T>(
    keys: string[],
    dataProvider: (key: string) => Promise<T>,
    options: Partial<CacheConfig> = {}
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const data = await dataProvider(key);
        await this.set(key, data, options);
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Odds data cache-elése
   */
  async cacheOddsData(
    sport: string,
    bookmaker: string,
    data: any,
    ttl: number = 30 // 30 másodperc odds adatokhoz
  ): Promise<void> {
    const key = `odds_${sport}_${bookmaker}`;
    await this.set(key, data, {
      ttl_seconds: ttl,
      strategy: 'redis',
      compression_enabled: true,
    });
  }

  /**
   * Arbitrage opportunities cache-elése
   */
  async cacheArbitrageOpportunities(
    filters: any,
    data: any,
    ttl: number = 60 // 1 perc arbitrage adatokhoz
  ): Promise<void> {
    const key = `arbitrage_${JSON.stringify(filters)}`;
    await this.set(key, data, {
      ttl_seconds: ttl,
      strategy: 'redis',
      compression_enabled: true,
    });
  }

  /**
   * User analytics cache-elése
   */
  async cacheUserAnalytics(
    userId: string,
    timeRange: string,
    data: any,
    ttl: number = 300 // 5 perc analytics adatokhoz
  ): Promise<void> {
    const key = `analytics_${userId}_${timeRange}`;
    await this.set(key, data, {
      ttl_seconds: ttl,
      strategy: 'memory', // Gyakran használt adatok memory-ben
      compression_enabled: false,
    });
  }

  /**
   * Memory cache kezelés
   */
  private getFromMemoryCache<T>(key: string): CacheItem<T> | null {
    return this.memoryCache.get(key) as CacheItem<T> | null;
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanupExpiredItems(): void {
    const keysToDelete: string[] = [];
    const entries = Array.from(this.memoryCache.entries());
    for (const [key, item] of entries) {
      if (this.isExpired(item)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  private enforceCacheSizeLimit(): void {
    const maxSize = 1000; // Maximum 1000 item memory cache-ben
    if (this.memoryCache.size > maxSize) {
      const items = Array.from(this.memoryCache.entries());
      items.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Legrégebbi elemek törlése
      const toDelete = items.slice(0, this.memoryCache.size - maxSize);
      toDelete.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  private getMemoryUsage(): number {
    // Egyszerű memory usage becslés
    let size = 0;
    const entries = Array.from(this.memoryCache.entries());
    for (const [key, value] of entries) {
      size += key.length;
      size += JSON.stringify(value).length;
    }
    return size;
  }

  private resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Redis cache kezelés (példa implementáció)
   */
  private async setRedisCache<T>(key: string, item: CacheItem<T>, config: CacheConfig): Promise<void> {
    // Itt lenne a tényleges Redis implementáció
    // Példa: Redis client használata
    try {
      // const redis = await this.getRedisClient();
      // await redis.setex(key, config.ttl_seconds, JSON.stringify(item));
      console.log(`Redis cache set: ${key}`);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  private async getFromRedisCache<T>(key: string): Promise<CacheItem<T> | null> {
    // Itt lenne a tényleges Redis implementáció
    try {
      // const redis = await this.getRedisClient();
      // const data = await redis.get(key);
      // return data ? JSON.parse(data) : null;
      return null; // Példa implementáció
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  private async deleteFromRedisCache(key: string): Promise<void> {
    // Itt lenne a tényleges Redis implementáció
    try {
      // const redis = await this.getRedisClient();
      // await redis.del(key);
      console.log(`Redis cache delete: ${key}`);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  private async clearRedisCachePattern(pattern: string): Promise<void> {
    // Itt lenne a tényleges Redis implementáció
    try {
      // const redis = await this.getRedisClient();
      // const keys = await redis.keys(`*${pattern}*`);
      // if (keys.length > 0) {
      //   await redis.del(...keys);
      // }
      console.log(`Redis pattern clear: ${pattern}`);
    } catch (error) {
      console.error('Redis pattern clear error:', error);
    }
  }

  private async clearAllRedisCache(): Promise<void> {
    // Itt lenne a tényleges Redis implementáció
    try {
      // const redis = await this.getRedisClient();
      // await redis.flushall();
      console.log('Redis cache cleared');
    } catch (error) {
      console.error('Redis clear all error:', error);
    }
  }
}

// Singleton export
export const cacheManager = CacheManager.getInstance();
