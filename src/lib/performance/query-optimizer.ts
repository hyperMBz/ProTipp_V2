"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cacheManager } from './cache-manager';

export interface QueryConfig {
  enableCaching: boolean;
  cacheTTL: number;
  enablePagination: boolean;
  maxPageSize: number;
  enableIndexHints: boolean;
  timeout: number;
}

export interface QueryMetrics {
  query_id: string;
  execution_time: number;
  rows_returned: number;
  cache_hit: boolean;
  timestamp: Date;
  query_hash: string;
}

export interface OptimizedQuery {
  originalQuery: string;
  optimizedQuery: string;
  estimatedImprovement: number;
  indexSuggestions: string[];
}

/**
 * Database Query Optimizer
 */
export class QueryOptimizer {
  private metrics: QueryMetrics[] = [];
  private queryCache = new Map<string, any>();

  constructor(
    private supabase: SupabaseClient,
    private config: QueryConfig = {
      enableCaching: true,
      cacheTTL: 300,
      enablePagination: true,
      maxPageSize: 1000,
      enableIndexHints: true,
      timeout: 10000,
    }
  ) {}

  /**
   * Execute optimized query with caching
   */
  async executeQuery<T>(
    tableName: string,
    query: any,
    options: {
      cache?: boolean;
      ttl?: number;
      paginate?: boolean;
      pageSize?: number;
    } = {}
  ): Promise<T[]> {
    const startTime = performance.now();
    const queryHash = this.generateQueryHash(tableName, query);
    
    try {
      // Check cache first
      if ((options.cache ?? this.config.enableCaching)) {
        const cached = await cacheManager.get<T[]>(queryHash);
        if (cached) {
          this.recordMetrics(queryHash, performance.now() - startTime, cached.length, true);
          return cached;
        }
      }

      // Execute optimized query
      let supabaseQuery = this.supabase.from(tableName);

      // Apply query optimizations
      supabaseQuery = this.applyOptimizations(supabaseQuery, query, options);

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(`Query error: ${error.message}`);
      }

      const result = data as T[];

      // Cache the result
      if (options.cache ?? this.config.enableCaching) {
        await cacheManager.set(
          queryHash,
          result,
          options.ttl ?? this.config.cacheTTL
        );
      }

      this.recordMetrics(queryHash, performance.now() - startTime, result.length, false);
      return result;

    } catch (error) {
      console.error('[QueryOptimizer] Query execution error:', error);
      throw error;
    }
  }

  /**
   * Execute optimized arbitrage queries
   */
  async getArbitrageOpportunities(filters: {
    sport?: string;
    minProfit?: number;
    maxRisk?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const query = {
      select: `
        *,
        bookmaker1:bookmakers!inner(name, logo_url),
        bookmaker2:bookmakers!inner(name, logo_url)
      `,
      filters: {
        profit: { gte: filters.minProfit || 0 },
        risk_level: { lte: filters.maxRisk || 10 },
        ...(filters.sport && { sport: { eq: filters.sport } }),
        status: { eq: 'active' },
      },
      order: { profit: { ascending: false } },
      limit: filters.limit || 50,
    };

    return this.executeQuery('arbitrage_opportunities', query, {
      cache: true,
      ttl: 60, // 1 minute for arbitrage data
      pageSize: 50,
    });
  }

  /**
   * Execute optimized odds queries
   */
  async getLatestOdds(filters: {
    bookmaker?: string;
    sport?: string;
    event?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    const query = {
      select: `
        *,
        bookmaker:bookmakers!inner(name, logo_url),
        event:events!inner(name, sport, start_time)
      `,
      filters: {
        ...(filters.bookmaker && { bookmaker_id: { eq: filters.bookmaker } }),
        ...(filters.sport && { 'event.sport': { eq: filters.sport } }),
        ...(filters.event && { 'event.name': { ilike: `%${filters.event}%` } }),
        updated_at: { gte: new Date(Date.now() - 3600000).toISOString() }, // Last hour
      },
      order: { updated_at: { ascending: false } },
      limit: filters.limit || 100,
    };

    return this.executeQuery('odds', query, {
      cache: true,
      ttl: 120, // 2 minutes for odds data
      pageSize: 100,
    });
  }

  /**
   * Execute optimized analytics queries
   */
  async getAnalyticsData(period: 'day' | 'week' | 'month', userId?: string): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }

    const query = {
      select: `
        *,
        bet:bets!inner(amount, odds, profit_loss, created_at)
      `,
      filters: {
        ...(userId && { user_id: { eq: userId } }),
        'bet.created_at': {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
      order: { 'bet.created_at': { ascending: false } },
    };

    return this.executeQuery('user_analytics', query, {
      cache: true,
      ttl: 600, // 10 minutes for analytics
      pageSize: 500,
    });
  }

  /**
   * Batch execute multiple queries
   */
  async executeBatch(queries: Array<{
    name: string;
    table: string;
    query: any;
    options?: any;
  }>): Promise<Record<string, any[]>> {
    try {
      const promises = queries.map(async ({ name, table, query, options }) => {
        const result = await this.executeQuery(table, query, options);
        return { name, result };
      });

      const results = await Promise.all(promises);
      
      return results.reduce((acc, { name, result }) => {
        acc[name] = result;
        return acc;
      }, {} as Record<string, any[]>);

    } catch (error) {
      console.error('[QueryOptimizer] Batch execution error:', error);
      throw error;
    }
  }

  /**
   * Apply query optimizations
   */
  private applyOptimizations(query: any, config: any, options: any): any {
    let optimizedQuery = query;

    // Apply select optimization
    if (config.select) {
      optimizedQuery = optimizedQuery.select(config.select);
    }

    // Apply filters
    if (config.filters) {
      Object.entries(config.filters).forEach(([column, condition]: [string, any]) => {
        if (typeof condition === 'object') {
          Object.entries(condition).forEach(([operator, value]) => {
            switch (operator) {
              case 'eq':
                optimizedQuery = optimizedQuery.eq(column, value);
                break;
              case 'neq':
                optimizedQuery = optimizedQuery.neq(column, value);
                break;
              case 'gt':
                optimizedQuery = optimizedQuery.gt(column, value);
                break;
              case 'gte':
                optimizedQuery = optimizedQuery.gte(column, value);
                break;
              case 'lt':
                optimizedQuery = optimizedQuery.lt(column, value);
                break;
              case 'lte':
                optimizedQuery = optimizedQuery.lte(column, value);
                break;
              case 'like':
                optimizedQuery = optimizedQuery.like(column, value);
                break;
              case 'ilike':
                optimizedQuery = optimizedQuery.ilike(column, value);
                break;
              case 'in':
                optimizedQuery = optimizedQuery.in(column, value);
                break;
            }
          });
        } else {
          optimizedQuery = optimizedQuery.eq(column, condition);
        }
      });
    }

    // Apply ordering
    if (config.order) {
      Object.entries(config.order).forEach(([column, direction]: [string, any]) => {
        optimizedQuery = optimizedQuery.order(column, direction);
      });
    }

    // Apply pagination
    if (options.paginate ?? this.config.enablePagination) {
      const pageSize = Math.min(
        options.pageSize ?? 50,
        this.config.maxPageSize
      );
      optimizedQuery = optimizedQuery.limit(pageSize);
    } else if (config.limit) {
      optimizedQuery = optimizedQuery.limit(config.limit);
    }

    return optimizedQuery;
  }

  /**
   * Generate query hash for caching
   */
  private generateQueryHash(tableName: string, query: any): string {
    const queryString = JSON.stringify({ tableName, query });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `query:${Math.abs(hash)}`;
  }

  /**
   * Record query metrics
   */
  private recordMetrics(
    queryHash: string,
    executionTime: number,
    rowsReturned: number,
    cacheHit: boolean
  ): void {
    const metric: QueryMetrics = {
      query_id: queryHash,
      execution_time: executionTime,
      rows_returned: rowsReturned,
      cache_hit: cacheHit,
      timestamp: new Date(),
      query_hash: queryHash,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get query performance metrics
   */
  getMetrics(): {
    averageExecutionTime: number;
    cacheHitRate: number;
    totalQueries: number;
    slowQueries: QueryMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageExecutionTime: 0,
        cacheHitRate: 0,
        totalQueries: 0,
        slowQueries: [],
      };
    }

    const totalTime = this.metrics.reduce((sum, m) => sum + m.execution_time, 0);
    const cacheHits = this.metrics.filter(m => m.cache_hit).length;
    const slowQueries = this.metrics
      .filter(m => m.execution_time > 1000) // Queries over 1 second
      .sort((a, b) => b.execution_time - a.execution_time)
      .slice(0, 10);

    return {
      averageExecutionTime: totalTime / this.metrics.length,
      cacheHitRate: cacheHits / this.metrics.length,
      totalQueries: this.metrics.length,
      slowQueries,
    };
  }

  /**
   * Clear query cache
   */
  async clearCache(): Promise<void> {
    await cacheManager.invalidatePattern('query:.*');
    this.queryCache.clear();
  }

  /**
   * Optimize query suggestions
   */
  analyzeQuery(query: string): OptimizedQuery {
    // Basic query analysis and optimization suggestions
    const suggestions: string[] = [];
    let optimizedQuery = query;
    let estimatedImprovement = 0;

    // Check for missing indexes
    if (query.includes('WHERE') && !query.includes('INDEX')) {
      suggestions.push('Consider adding indexes on filtered columns');
      estimatedImprovement += 30;
    }

    // Check for SELECT *
    if (query.includes('SELECT *')) {
      suggestions.push('Avoid SELECT * - specify only needed columns');
      optimizedQuery = query.replace('SELECT *', 'SELECT id, name, created_at');
      estimatedImprovement += 20;
    }

    // Check for missing LIMIT
    if (!query.includes('LIMIT') && !query.includes('COUNT')) {
      suggestions.push('Add LIMIT clause to prevent large result sets');
      optimizedQuery += ' LIMIT 100';
      estimatedImprovement += 15;
    }

    return {
      originalQuery: query,
      optimizedQuery,
      estimatedImprovement,
      indexSuggestions: suggestions,
    };
  }
}

// Create optimized Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const optimizedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

export const queryOptimizer = new QueryOptimizer(optimizedSupabase);
