

export interface CacheConfig {
  cache_key: string;
  ttl_seconds: number;
  strategy: 'memory' | 'redis' | 'cdn';
  invalidation_rules: string[];
  compression_enabled: boolean;
  version: string;
}


