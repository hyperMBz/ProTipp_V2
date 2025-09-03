/**
 * CDN Manager
 * Content Delivery Network integráció és statikus asset optimalizálás
 */

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'aws-cloudfront' | 'vercel' | 'custom';
  baseUrl: string;
  fallbackUrl?: string;
  cacheControl: {
    static: string;
    images: string;
    fonts: string;
    scripts: string;
  };
  optimization: {
    imageCompression: boolean;
    formatConversion: boolean;
    lazyLoading: boolean;
    preloading: boolean;
  };
}

export interface CDNStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  bandwidthSaved: number;
  errors: number;
}

export interface AssetInfo {
  url: string;
  size: number;
  type: string;
  lastModified: Date;
  cacheStatus: 'hit' | 'miss' | 'error';
  responseTime: number;
}

export class CDNManager {
  private static instance: CDNManager;
  private config: CDNConfig;
  private stats: CDNStats;
  private assetCache: Map<string, AssetInfo> = new Map();

  constructor(config: Partial<CDNConfig> = {}) {
    this.config = {
      enabled: true,
      provider: 'vercel',
      baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
      fallbackUrl: process.env.NEXT_PUBLIC_FALLBACK_URL || '',
      cacheControl: {
        static: 'public, max-age=31536000, immutable',
        images: 'public, max-age=86400, stale-while-revalidate=604800',
        fonts: 'public, max-age=31536000, immutable',
        scripts: 'public, max-age=31536000, immutable',
      },
      optimization: {
        imageCompression: true,
        formatConversion: true,
        lazyLoading: true,
        preloading: true,
      },
      ...config,
    };

    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      bandwidthSaved: 0,
      errors: 0,
    };
  }

  static getInstance(config?: Partial<CDNConfig>): CDNManager {
    if (!CDNManager.instance) {
      CDNManager.instance = new CDNManager(config);
    }
    return CDNManager.instance;
  }

  /**
   * Asset URL generálása CDN-nel
   */
  getAssetUrl(path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    optimize?: boolean;
  }): string {
    if (!this.config.enabled || !this.config.baseUrl) {
      return path;
    }

    try {
      let url = `${this.config.baseUrl}${path}`;

      // Image optimization paraméterek
      if (options && this.config.optimization.imageCompression) {
        const params = new URLSearchParams();
        
        if (options.width) params.append('w', options.width.toString());
        if (options.height) params.append('h', options.height.toString());
        if (options.quality) params.append('q', options.quality.toString());
        if (options.format) params.append('f', options.format);
        if (options.optimize) params.append('opt', '1');

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      return url;
    } catch (error) {
      console.error('CDN URL generation failed:', error);
      return path;
    }
  }

  /**
   * Image URL optimalizálása
   */
  getOptimizedImageUrl(
    path: string,
    width?: number,
    height?: number,
    quality: number = 80,
    format: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp'
  ): string {
    return this.getAssetUrl(path, {
      width,
      height,
      quality,
      format,
      optimize: true,
    });
  }

  /**
   * Font URL generálása
   */
  getFontUrl(path: string): string {
    return this.getAssetUrl(path, { optimize: false });
  }

  /**
   * Script URL generálása
   */
  getScriptUrl(path: string): string {
    return this.getAssetUrl(path, { optimize: false });
  }

  /**
   * Asset preloading
   */
  preloadAsset(path: string, type: 'image' | 'font' | 'script' | 'style'): void {
    if (!this.config.enabled || !this.config.optimization.preloading) {
      return;
    }

    try {
      const url = this.getAssetUrl(path);
      const link = document.createElement('link');
      
      link.rel = 'preload';
      link.href = url;
      
      switch (type) {
        case 'image':
          link.as = 'image';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
      }

      document.head.appendChild(link);
    } catch (error) {
      console.error('Asset preloading failed:', error);
    }
  }

  /**
   * Lazy loading helper
   */
  createLazyImage(
    src: string,
    alt: string,
    placeholder?: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    }
  ): {
    src: string;
    srcSet?: string;
    sizes?: string;
    loading: 'lazy';
    placeholder?: string;
  } {
    if (!this.config.enabled || !this.config.optimization.lazyLoading) {
      return {
        src: this.getOptimizedImageUrl(src, options?.width, options?.height, options?.quality),
        loading: 'lazy',
        placeholder,
      };
    }

    // Responsive image srcSet generálása
    const srcSet = this.generateSrcSet(src, options?.quality || 80);
    const sizes = this.generateSizes(options?.width);

    return {
      src: this.getOptimizedImageUrl(src, options?.width, options?.height, options?.quality),
      srcSet,
      sizes,
      loading: 'lazy',
      placeholder,
    };
  }

  /**
   * Asset cache-elés
   */
  async cacheAsset(path: string): Promise<AssetInfo | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      const url = this.getAssetUrl(path);
      const startTime = performance.now();

      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'force-cache',
      });

      const responseTime = performance.now() - startTime;

      if (!response.ok) {
        this.stats.errors++;
        return null;
      }

      const assetInfo: AssetInfo = {
        url,
        size: parseInt(response.headers.get('content-length') || '0'),
        type: response.headers.get('content-type') || 'unknown',
        lastModified: new Date(response.headers.get('last-modified') || Date.now()),
        cacheStatus: response.headers.get('x-cache') === 'HIT' ? 'hit' : 'miss',
        responseTime,
      };

      this.assetCache.set(path, assetInfo);
      this.updateStats(assetInfo);

      return assetInfo;
    } catch (error) {
      console.error('Asset caching failed:', error);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * CDN health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errors: string[];
  }> {
    if (!this.config.enabled) {
      return {
        status: 'healthy',
        responseTime: 0,
        errors: ['CDN disabled'],
      };
    }

    const errors: string[] = [];
    const startTime = performance.now();

    try {
      // Test CDN endpoint
      const testUrl = `${this.config.baseUrl}/favicon.ico`;
      const response = await fetch(testUrl, { method: 'HEAD' });

      const responseTime = performance.now() - startTime;

      if (!response.ok) {
        errors.push(`CDN endpoint returned ${response.status}`);
      }

      // Test fallback if available
      if (this.config.fallbackUrl) {
        try {
          const fallbackResponse = await fetch(`${this.config.fallbackUrl}/favicon.ico`, {
            method: 'HEAD',
          });
          
          if (!fallbackResponse.ok) {
            errors.push(`Fallback endpoint returned ${fallbackResponse.status}`);
          }
        } catch (error) {
          errors.push(`Fallback endpoint failed: ${error}`);
        }
      }

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (errors.length > 0) {
        status = errors.length >= 2 ? 'unhealthy' : 'degraded';
      }

      return {
        status,
        responseTime,
        errors,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        errors: [`CDN health check failed: ${error}`],
      };
    }
  }

  /**
   * CDN statisztikák
   */
  getStats(): CDNStats {
    return { ...this.stats };
  }

  /**
   * Cache törlése
   */
  clearCache(): void {
    this.assetCache.clear();
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Segédfüggvények
   */
  private generateSrcSet(src: string, quality: number): string {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(width => `${this.getOptimizedImageUrl(src, width, undefined, quality)} ${width}w`)
      .join(', ');
  }

  private generateSizes(width?: number): string {
    if (!width) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
    
    if (width <= 768) {
      return '100vw';
    } else if (width <= 1200) {
      return '50vw';
    } else {
      return '33vw';
    }
  }

  private updateStats(assetInfo: AssetInfo): void {
    this.stats.totalRequests++;
    
    if (assetInfo.cacheStatus === 'hit') {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }

    // Average response time frissítése
    const totalTime = this.stats.averageResponseTime * (this.stats.totalRequests - 1) + assetInfo.responseTime;
    this.stats.averageResponseTime = totalTime / this.stats.totalRequests;

    // Bandwidth savings számítása (cache hit esetén)
    if (assetInfo.cacheStatus === 'hit') {
      this.stats.bandwidthSaved += assetInfo.size;
    }
  }
}

// Singleton export
export const cdnManager = CDNManager.getInstance();
