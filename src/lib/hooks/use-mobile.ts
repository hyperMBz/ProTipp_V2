"use client";

import { useState, useEffect, useCallback } from "react";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  userAgent: string;
}

export interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  canInstall: boolean;
  installPrompt: any | null;
}

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastOnline: Date | null;
  connectionType?: 'wifi' | 'cellular' | 'none';
}

/**
 * Hook az eszköz információk lekéréséhez
 */
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    screenSize: { width: 0, height: 0 },
    orientation: 'portrait',
    userAgent: '',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Screen size
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Orientation
      const orientation = width > height ? 'landscape' : 'portrait';

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        screenSize: { width, height },
        orientation,
        userAgent,
      });
    };

    // Initial update
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook a PWA státus kezeléséhez
 */
export function usePWAStatus(): PWAStatus {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    canInstall: false,
    installPrompt: null,
  });

  useEffect(() => {
    const updatePWAStatus = () => {
      // Check if app is installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;

      // Check if app can be installed
      const canInstall = 'serviceWorker' in navigator && 'PushManager' in window;

      setPwaStatus(prev => ({
        ...prev,
        isInstalled,
        canInstall,
      }));
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaStatus(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setPwaStatus(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    updatePWAStatus();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return pwaStatus;
}

/**
 * Hook az offline státus kezeléséhez
 */
export function useOfflineStatus(): OfflineStatus {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    lastOnline: navigator.onLine ? new Date() : null,
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setOfflineStatus(prev => ({
        isOnline,
        isOffline: !isOnline,
        lastOnline: isOnline ? new Date() : prev.lastOnline,
        connectionType: getConnectionType(),
      }));
    };

    const getConnectionType = (): 'wifi' | 'cellular' | 'none' => {
      if (!navigator.onLine) return 'none';
      
      // Try to detect connection type (not always available)
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
          case '3g':
          case '4g':
            return 'cellular';
          default:
            return 'wifi';
        }
      }
      
      return 'wifi'; // Default assumption
    };

    // Initial update
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return offlineStatus;
}

/**
 * Hook a mobil optimalizált méretezéshez
 */
export function useMobileScaling() {
  const { isMobile, screenSize } = useDeviceInfo();

  const getScaledSize = useCallback((baseSize: number, mobileRatio: number = 0.8) => {
    if (!isMobile) return baseSize;
    return Math.round(baseSize * mobileRatio);
  }, [isMobile]);

  const getScaledSpacing = useCallback((baseSpacing: number, mobileRatio: number = 0.7) => {
    if (!isMobile) return baseSpacing;
    return Math.round(baseSpacing * mobileRatio);
  }, [isMobile]);

  const getResponsiveValue = useCallback(<T>(
    mobileValue: T,
    tabletValue: T,
    desktopValue: T
  ): T => {
    if (isMobile) return mobileValue;
    if (screenSize.width < 1024) return tabletValue;
    return desktopValue;
  }, [isMobile, screenSize.width]);

  return {
    getScaledSize,
    getScaledSpacing,
    getResponsiveValue,
  };
}

/**
 * Hook a mobil gesztusok kezeléséhez
 */
export function useMobileGestures() {
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);

  const addGesture = useCallback((gesture: string) => {
    setGestureHistory(prev => [...prev.slice(-4), gesture]); // Keep last 5 gestures
  }, []);

  const clearGestureHistory = useCallback(() => {
    setGestureHistory([]);
  }, []);

  const getLastGesture = useCallback(() => {
    return gestureHistory[gestureHistory.length - 1];
  }, [gestureHistory]);

  return {
    gestureHistory,
    addGesture,
    clearGestureHistory,
    getLastGesture,
  };
}

/**
 * Hook a mobil teljesítmény monitorozásához
 */
export function useMobilePerformance() {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    memoryUsage: 0,
    batteryLevel: 0,
  });

  useEffect(() => {
    const updatePerformanceMetrics = () => {
      // Load time
      const loadTime = performance.now();

      // Memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      // Battery level (if available)
      const getBatteryLevel = async () => {
        try {
          const battery = await (navigator as any).getBattery?.();
          return battery ? battery.level * 100 : 0;
        } catch {
          return 0;
        }
      };

      getBatteryLevel().then(batteryLevel => {
        setPerformanceMetrics({
          loadTime,
          memoryUsage,
          batteryLevel,
        });
      });
    };

    // Update on load
    updatePerformanceMetrics();

    // Update periodically
    const interval = setInterval(updatePerformanceMetrics, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return performanceMetrics;
}

/**
 * Hook a mobil beállítások kezeléséhez
 */
export function useMobilePreferences() {
  const [preferences, setPreferences] = useState({
    dataSaver: false,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  });

  useEffect(() => {
    // Check for user preferences
    const mediaQueries = {
      dataSaver: window.matchMedia('(prefers-reduced-data: reduce)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-reduced-motion: reduce)'),
    };

    const updatePreferences = () => {
      setPreferences({
        dataSaver: mediaQueries.dataSaver.matches,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches,
      });
    };

    updatePreferences();

    // Listen for preference changes
    Object.values(mediaQueries).forEach(query => {
      query.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(mediaQueries).forEach(query => {
        query.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  return preferences;
}
