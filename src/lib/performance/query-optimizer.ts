/**
 * Database Query Optimizer
 * Supabase lekérdezések optimalizálása és teljesítmény javítása
 */

import { createClient } from '@supabase/supabase-js';

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowsReturned: number;
  cacheHit: boolean;
  timestamp: Date;
}

export interface QueryOptimizationConfig {
  enableQueryCache: boolean;
  cacheTTL: number; // másodpercben
  maxQueryTime: number; // milliszekundumban
  enableConnectionPooling: boolean;
  poolSize: number;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private metrics: QueryMetrics[] = [];
  private config: QueryOptimizationConfig;

  constructor(config: Partial<QueryOptimizationConfig> = {}) {
    this.config = {
      enableQueryCache: true,
      cacheTTL: 300, // 5 perc
      maxQueryTime: 1000, // 1 másodperc
      enableConnectionPooling: true,
      poolSize: 10,
      ...config,
    };
  }

  static getInstance(config?: Partial<QueryOptimizationConfig>): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer(config);
    }
    return QueryOptimizer.instance;
  }

  /**
   * Optimalizált lekérdezés végrehajtása cache-eléssel
   */
  async executeQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey?: string,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> {
    const startTime = performance.now();
    const queryId = cacheKey || this.generateQueryKey(queryFn);

    try {
      // Cache ellenőrzés
      if (this.config.enableQueryCache && !options?.forceRefresh) {
        const cachedResult = this.getFromCache(queryId);
        if (cachedResult) {
          this.recordMetrics({
            query: queryId,
            executionTime: 0,
            rowsReturned: Array.isArray(cachedResult) ? cachedResult.length : 1,
            cacheHit: true,
            timestamp: new Date(),
          });
          return cachedResult as T;
        }
      }

      // Lekérdezés végrehajtása
      const result = await queryFn();
      const executionTime = performance.now() - startTime;

      // Cache mentés
      if (this.config.enableQueryCache) {
        this.setCache(queryId, result, options?.ttl || this.config.cacheTTL);
      }

      // Metrikák rögzítése
      this.recordMetrics({
        query: queryId,
        executionTime,
        rowsReturned: Array.isArray(result) ? result.length : 1,
        cacheHit: false,
        timestamp: new Date(),
      });

      // Teljesítmény ellenőrzés
      if (executionTime > this.config.maxQueryTime) {
        console.warn(`Slow query detected: ${queryId} took ${executionTime.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error(`Query failed: ${queryId}`, error);
      
      this.recordMetrics({
        query: queryId,
        executionTime,
        rowsReturned: 0,
        cacheHit: false,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Arbitrage opportunities lekérdezése optimalizált cache-eléssel
   */
  async getArbitrageOpportunities(
    filters?: {
      minProfit?: number;
      maxRisk?: number;
      sports?: string[];
      bookmakers?: string[];
    }
  ) {
    const cacheKey = `arbitrage_opportunities_${JSON.stringify(filters)}`;
    
    return this.executeQuery(
      async () => {
        // Itt a tényleges Supabase lekérdezés lenne
        // Példa implementáció
        const { data, error } = await this.optimizedArbitrageQuery(filters);
        if (error) throw error;
        return data;
      },
      cacheKey,
      { ttl: 60 } // 1 perc cache arbitrage adatokhoz
    );
  }

  /**
   * Odds data lekérdezése optimalizált cache-eléssel
   */
  async getOddsData(
    sport?: string,
    bookmaker?: string,
    limit?: number
  ) {
    const cacheKey = `odds_data_${sport}_${bookmaker}_${limit}`;
    
    return this.executeQuery(
      async () => {
        // Itt a tényleges Supabase lekérdezés lenne
        const { data, error } = await this.optimizedOddsQuery(sport, bookmaker, limit);
        if (error) throw error;
        return data;
      },
      cacheKey,
      { ttl: 30 } // 30 másodperc cache odds adatokhoz
    );
  }

  /**
   * User analytics lekérdezése optimalizált cache-eléssel
   */
  async getUserAnalytics(userId: string, timeRange?: string) {
    const cacheKey = `user_analytics_${userId}_${timeRange}`;
    
    return this.executeQuery(
      async () => {
        // Itt a tényleges Supabase lekérdezés lenne
        const { data, error } = await this.optimizedAnalyticsQuery(userId, timeRange);
        if (error) throw error;
        return data;
      },
      cacheKey,
      { ttl: 300 } // 5 perc cache analytics adatokhoz
    );
  }

  /**
   * Cache kezelés
   */
  private getFromCache(key: string): any | null {
    const cached = this.queryCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

          // Cache méret korlátozása
      if (this.queryCache.size > 1000) {
        const firstKey = this.queryCache.keys().next().value;
        if (firstKey) {
          this.queryCache.delete(firstKey);
        }
      }
  }

  /**
   * Cache törlése
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete: string[] = [];
      const keys = Array.from(this.queryCache.keys());
      for (const key of keys) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.queryCache.delete(key));
    } else {
      this.queryCache.clear();
    }
  }

  /**
   * Cache statisztikák
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalQueries: number;
    cachedQueries: number;
  } {
    const totalQueries = this.metrics.length;
    const cachedQueries = this.metrics.filter(m => m.cacheHit).length;
    const hitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;

    return {
      size: this.queryCache.size,
      hitRate,
      totalQueries,
      cachedQueries,
    };
  }

  /**
   * Teljesítmény metrikák
   */
  getPerformanceMetrics(): {
    averageResponseTime: number;
    slowQueries: QueryMetrics[];
    topQueries: QueryMetrics[];
  } {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000 // Utolsó 24 óra
    );

    const averageResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length
      : 0;

    const slowQueries = recentMetrics
      .filter(m => m.executionTime > this.config.maxQueryTime)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    const topQueries = recentMetrics
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      averageResponseTime,
      slowQueries,
      topQueries,
    };
  }

  /**
   * Segédfüggvények
   */
  private generateQueryKey(queryFn: Function): string {
    return `query_${queryFn.toString().slice(0, 50)}_${Date.now()}`;
  }

  private recordMetrics(metrics: QueryMetrics): void {
    this.metrics.push(metrics);
    
    // Metrikák méret korlátozása
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  /**
   * Optimalizált Supabase lekérdezések (példa implementációk)
   */
  private async optimizedArbitrageQuery(filters?: any) {
    // Itt a tényleges Supabase lekérdezés lenne
    // Példa: proper indexing, LIMIT, WHERE feltételek optimalizálása
    return { data: [], error: null };
  }

  private async optimizedOddsQuery(sport?: string, bookmaker?: string, limit?: number) {
    // Itt a tényleges Supabase lekérdezés lenne
    // Példa: indexek használata, JOIN optimalizálás
    return { data: [], error: null };
  }

  private async optimizedAnalyticsQuery(userId: string, timeRange?: string) {
    // Itt a tényleges Supabase lekérdezés lenne
    // Példa: aggregációk, window functions
    return { data: [], error: null };
  }
}

// Singleton export
export const queryOptimizer = QueryOptimizer.getInstance();
