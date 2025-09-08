/**
 * Cache Strategy Implementation
 * Implements various caching strategies for optimal performance
 */

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, value: T): void {
    const now = Date.now();
    
    // Check if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private evict(): void {
    switch (this.config.strategy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'fifo':
        this.evictFIFO();
        break;
      case 'ttl':
        this.evictTTL();
        break;
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private evictFIFO(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private evictTTL(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: entries.reduce((sum, entry) => sum + entry.accessCount, 0) / Math.max(entries.length, 1),
      averageAge: entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / Math.max(entries.length, 1),
      oldestEntry: Math.min(...entries.map(entry => entry.timestamp)),
      newestEntry: Math.max(...entries.map(entry => entry.timestamp)),
    };
  }
}

// Predefined cache configurations
export const CACHE_CONFIGS = {
  // API responses cache (5 minutes)
  API: {
    ttl: 300,
    maxSize: 100,
    strategy: 'lru' as const,
  },
  
  // User data cache (15 minutes)
  USER_DATA: {
    ttl: 900,
    maxSize: 50,
    strategy: 'lru' as const,
  },
  
  // Static content cache (1 hour)
  STATIC: {
    ttl: 3600,
    maxSize: 200,
    strategy: 'ttl' as const,
  },
  
  // Real-time data cache (30 seconds)
  REALTIME: {
    ttl: 30,
    maxSize: 20,
    strategy: 'fifo' as const,
  },
} as const;

// Global cache instances
export const apiCache = new CacheManager<any>(CACHE_CONFIGS.API);
export const userDataCache = new CacheManager<any>(CACHE_CONFIGS.USER_DATA);
export const staticCache = new CacheManager<any>(CACHE_CONFIGS.STATIC);
export const realtimeCache = new CacheManager<any>(CACHE_CONFIGS.REALTIME);

// Cache utility functions
export function withCache<T>(
  cache: CacheManager<T>,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then(result => {
    cache.set(key, result);
    return result;
  });
}

export function invalidateCachePattern(
  cache: CacheManager<any>,
  pattern: string | RegExp
): void {
  const keys = Array.from(cache['cache'].keys());
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.delete(key);
    }
  });
}

// Browser storage cache (localStorage/sessionStorage)
export class BrowserCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix: string = 'protip_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  set(key: string, value: any, ttl?: number): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl ? ttl * 1000 : undefined,
    };
    
    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set cache item:', error);
    }
  }

  get(key: string): any | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);
      
      // Check TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('Failed to get cache item:', error);
      return null;
    }
  }

  delete(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }
}

export const browserCache = new BrowserCache();
export const sessionCache = new BrowserCache(sessionStorage);
