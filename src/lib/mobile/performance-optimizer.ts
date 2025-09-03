/**
 * Mobil Teljesítmény Optimalizáló
 * Lazy loading, képoptimalizálás és adatmentés
 */

import { useState, useEffect } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  batteryLevel: number;
  networkSpeed: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  deviceMemory: number;
  hardwareConcurrency: number;
}

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableDataSaving: boolean;
  enableMemoryOptimization: boolean;
  maxImageSize: number;
  compressionLevel: number;
}

export class MobilePerformanceOptimizer {
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableDataSaving: true,
      enableMemoryOptimization: true,
      maxImageSize: 1024 * 1024, // 1MB
      compressionLevel: 0.8,
      ...config,
    };

    this.metrics = this.getInitialMetrics();
    this.initialize();
  }

  /**
   * Inicializálás
   */
  private initialize() {
    // Teljesítmény metrikák figyelése
    this.startPerformanceMonitoring();
    
    // Network figyelés
    this.startNetworkMonitoring();
    
    // Memory figyelés
    this.startMemoryMonitoring();
    
    // Battery figyelés
    this.startBatteryMonitoring();
  }

  /**
   * Kezdeti metrikák lekérése
   */
  private getInitialMetrics(): PerformanceMetrics {
    return {
      loadTime: performance.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      batteryLevel: 0,
      networkSpeed: this.getNetworkSpeed(),
      deviceMemory: (navigator as any).deviceMemory || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
    };
  }

  /**
   * Hálózati sebesség meghatározása
   */
  private getNetworkSpeed(): 'slow-2g' | '2g' | '3g' | '4g' | 'unknown' {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      return connection.effectiveType || 'unknown';
    }
    
    return 'unknown';
  }

  /**
   * Teljesítmény figyelés indítása
   */
  private startPerformanceMonitoring() {
    // Page load time
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
      this.dispatchEvent('performanceUpdate', this.metrics);
    });

    // Memory usage monitoring
    if (this.config.enableMemoryOptimization) {
      setInterval(() => {
        this.metrics.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
        this.checkMemoryUsage();
      }, 30000); // 30 másodpercenként
    }
  }

  /**
   * Hálózati figyelés indítása
   */
  private startNetworkMonitoring() {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', () => {
        this.metrics.networkSpeed = this.getNetworkSpeed();
        this.adjustOptimizationLevel();
        this.dispatchEvent('networkChange', { speed: this.metrics.networkSpeed });
      });
    }
  }

  /**
   * Memory figyelés indítása
   */
  private startMemoryMonitoring() {
    if (this.config.enableMemoryOptimization) {
      setInterval(() => {
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryLimit = (performance as any).memory?.jsHeapSizeLimit || 0;
        
        if (memoryUsage > memoryLimit * 0.8) {
          this.optimizeMemory();
        }
      }, 10000); // 10 másodpercenként
    }
  }

  /**
   * Battery figyelés indítása
   */
  private startBatteryMonitoring() {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.metrics.batteryLevel = battery.level * 100;
        
        battery.addEventListener('levelchange', () => {
          this.metrics.batteryLevel = battery.level * 100;
          this.adjustOptimizationLevel();
          this.dispatchEvent('batteryChange', { level: this.metrics.batteryLevel });
        });
      });
    }
  }

  /**
   * Lazy loading beállítása
   */
  setupLazyLoading(selector: string, callback: (element: Element) => void) {
    if (!this.config.enableLazyLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => observer.observe(element));

    this.observers.set(selector, observer);
  }

  /**
   * Kép optimalizálás
   */
  optimizeImage(imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    if (!this.config.enableImageOptimization) return imageUrl;

    const { width, height, quality = this.config.compressionLevel, format = 'webp' } = options;
    
    // Kép méret optimalizálás hálózati sebesség alapján
    const optimizedWidth = this.getOptimizedImageSize(width);
    const optimizedQuality = this.getOptimizedImageQuality(quality);

    // WebP támogatás ellenőrzése
    const supportsWebP = this.supportsWebP();
    const finalFormat = supportsWebP ? format : 'jpeg';

    // Kép URL optimalizálása
    return this.buildOptimizedImageUrl(imageUrl, {
      width: optimizedWidth,
      height,
      quality: optimizedQuality,
      format: finalFormat,
    });
  }

  /**
   * Optimalizált kép méret meghatározása
   */
  private getOptimizedImageSize(baseWidth?: number): number | undefined {
    if (!baseWidth) return undefined;

    switch (this.metrics.networkSpeed) {
      case 'slow-2g':
      case '2g':
        return Math.min(baseWidth, 300);
      case '3g':
        return Math.min(baseWidth, 600);
      case '4g':
        return baseWidth;
      default:
        return Math.min(baseWidth, 800);
    }
  }

  /**
   * Optimalizált kép minőség meghatározása
   */
  private getOptimizedImageQuality(baseQuality: number): number {
    switch (this.metrics.networkSpeed) {
      case 'slow-2g':
      case '2g':
        return Math.min(baseQuality, 0.5);
      case '3g':
        return Math.min(baseQuality, 0.7);
      case '4g':
        return baseQuality;
      default:
        return Math.min(baseQuality, 0.8);
    }
  }

  /**
   * WebP támogatás ellenőrzése
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  /**
   * Optimalizált kép URL építése
   */
  private buildOptimizedImageUrl(
    originalUrl: string,
    options: { width?: number; height?: number; quality: number; format: string }
  ): string {
    // Itt implementálhatod a kép optimalizáló szolgáltatás integrációját
    // Például: Cloudinary, ImageKit, vagy saját kép optimalizáló
    
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    params.append('q', options.quality.toString());
    params.append('f', options.format);

    return `${originalUrl}?${params.toString()}`;
  }

  /**
   * Adatmentés mód beállítása
   */
  enableDataSaving() {
    if (!this.config.enableDataSaving) return;

    // Képek letiltása
    this.disableImages();
    
    // Animációk csökkentése
    this.reduceAnimations();
    
    // Cache-elés növelése
    this.increaseCaching();
    
    // Kompresszió növelése
    this.config.compressionLevel = 0.6;
    
    this.dispatchEvent('dataSavingEnabled', {});
  }

  /**
   * Képek letiltása adatmentés módban
   */
  private disableImages() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const originalSrc = img.src;
      img.setAttribute('data-original-src', originalSrc);
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent pixel
      img.style.filter = 'grayscale(100%)';
    });
  }

  /**
   * Animációk csökkentése
   */
  private reduceAnimations() {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }

  /**
   * Cache-elés növelése
   */
  private increaseCaching() {
    // Service Worker cache stratégia módosítása
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: 'INCREASE_CACHING',
          data: { maxAge: 86400 * 7 } // 7 nap
        });
      });
    }
  }

  /**
   * Memory optimalizálás
   */
  private optimizeMemory() {
    // Observer-ek törlése
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Event listener-ek törlése
    this.removeEventListeners();

    // Garbage collection kényszerítése
    if ('gc' in window) {
      (window as any).gc();
    }

    this.dispatchEvent('memoryOptimized', {});
  }

  /**
   * Event listener-ek eltávolítása
   */
  private removeEventListeners() {
    // Implementáld az event listener-ek eltávolítását
    // Ez specifikus a használt event listener-ekre
  }

  /**
   * Optimalizálási szint beállítása
   */
  private adjustOptimizationLevel() {
    const isLowBattery = this.metrics.batteryLevel < 20;
    const isSlowNetwork = ['slow-2g', '2g', '3g'].includes(this.metrics.networkSpeed);
    const isLowMemory = this.metrics.memoryUsage > (performance as any).memory?.jsHeapSizeLimit * 0.7;

    if (isLowBattery || isSlowNetwork || isLowMemory) {
      this.enableDataSaving();
    }
  }

  /**
   * Memory használat ellenőrzése
   */
  private checkMemoryUsage() {
    const memoryUsage = this.metrics.memoryUsage;
    const memoryLimit = (performance as any).memory?.jsHeapSizeLimit || 0;
    
    if (memoryUsage > memoryLimit * 0.8) {
      console.warn('[Performance] Magas memory használat:', memoryUsage);
      this.dispatchEvent('highMemoryUsage', { usage: memoryUsage, limit: memoryLimit });
    }
  }

  /**
   * Teljesítmény metrikák lekérése
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<OptimizationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.dispatchEvent('configUpdated', this.config);
  }

  /**
   * Optimalizáló törlése
   */
  destroy() {
    // Observer-ek törlése
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Event listener-ek törlése
    this.removeEventListeners();

    console.log('[Performance] Optimalizáló törölve');
  }

  /**
   * Custom események küldése
   */
  private dispatchEvent(type: string, detail: any) {
    const event = new CustomEvent(`performance:${type}`, { detail });
    window.dispatchEvent(event);
  }
}

/**
 * Hook a mobil teljesítmény optimalizáló használatához
 */
export function useMobilePerformanceOptimizer(config?: Partial<OptimizationConfig>) {
  const [optimizer] = useState(() => new MobilePerformanceOptimizer(config));
  const [metrics, setMetrics] = useState(optimizer.getMetrics());

  useEffect(() => {
    // Metrikák frissítése
    const updateMetrics = () => setMetrics(optimizer.getMetrics());
    
    // Teljesítmény események figyelése
    const handlePerformanceUpdate = (event: CustomEvent) => {
      setMetrics(event.detail);
    };

    const handleNetworkChange = (event: CustomEvent) => {
      updateMetrics();
    };

    const handleBatteryChange = (event: CustomEvent) => {
      updateMetrics();
    };

    window.addEventListener('performance:performanceUpdate', handlePerformanceUpdate as EventListener);
    window.addEventListener('performance:networkChange', handleNetworkChange as EventListener);
    window.addEventListener('performance:batteryChange', handleBatteryChange as EventListener);

    return () => {
      window.removeEventListener('performance:performanceUpdate', handlePerformanceUpdate as EventListener);
      window.removeEventListener('performance:networkChange', handleNetworkChange as EventListener);
      window.removeEventListener('performance:batteryChange', handleBatteryChange as EventListener);
      optimizer.destroy();
    };
  }, [optimizer]);

  return {
    optimizer,
    metrics,
    setupLazyLoading: (selector: string, callback: (element: Element) => void) => 
      optimizer.setupLazyLoading(selector, callback),
    optimizeImage: (url: string, options?: any) => optimizer.optimizeImage(url, options),
    enableDataSaving: () => optimizer.enableDataSaving(),
    updateConfig: (config: Partial<OptimizationConfig>) => optimizer.updateConfig(config),
  };
}
