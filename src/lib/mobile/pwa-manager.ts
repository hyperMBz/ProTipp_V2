/**
 * PWA Manager - Progresszív Webalkalmazás kezelő
 */

import { useState, useEffect } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
}

export class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private config: PWAConfig;

  constructor(config: PWAConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * PWA inicializálása
   */
  private initialize() {
    // Service Worker regisztrálása
    this.registerServiceWorker();
    
    // Install prompt esemény figyelése
    this.setupInstallPrompt();
    
    // App installed esemény figyelése
    this.setupAppInstalled();
    
    // PWA státus ellenőrzése
    this.checkInstallStatus();
  }

  /**
   * Service Worker regisztrálása
   */
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: this.config.scope,
        });

        console.log('[PWA] Service Worker regisztrálva:', registration);

        // Service Worker frissítés kezelése
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Új verzió elérhető
                this.showUpdateNotification();
              }
            });
          }
        });

        // Service Worker üzenetek kezelése
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

      } catch (error) {
        console.error('[PWA] Service Worker regisztrálási hiba:', error);
      }
    }
  }

  /**
   * Install prompt beállítása
   */
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as unknown as PWAInstallPrompt;
      console.log('[PWA] Install prompt elérhető');
      
      // Custom event küldése
      this.dispatchEvent('installPromptAvailable', { prompt: this.installPrompt });
    });
  }

  /**
   * App installed esemény beállítása
   */
  private setupAppInstalled() {
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      console.log('[PWA] Alkalmazás telepítve');
      
      this.dispatchEvent('appInstalled', {});
    });
  }

  /**
   * Telepítési státus ellenőrzése
   */
  private checkInstallStatus() {
    // Display mode ellenőrzése
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    this.isInstalled = isStandalone || isIOSStandalone;
    
    if (this.isInstalled) {
      console.log('[PWA] Alkalmazás már telepítve van');
    }
  }

  /**
   * PWA telepítés indítása
   */
  async install(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('[PWA] Install prompt nem elérhető');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('[PWA] Telepítés elfogadva');
        this.dispatchEvent('installAccepted', {});
        return true;
      } else {
        console.log('[PWA] Telepítés elutasítva');
        this.dispatchEvent('installDismissed', {});
        return false;
      }
    } catch (error) {
      console.error('[PWA] Telepítési hiba:', error);
      return false;
    }
  }

  /**
   * Frissítési értesítés megjelenítése
   */
  private showUpdateNotification() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Frissítési értesítés megjelenítése
      this.dispatchEvent('updateAvailable', {});
      
      // Automatikus frissítés opció
      if (confirm('Új verzió elérhető! Szeretné frissíteni az alkalmazást?')) {
        this.updateApp();
      }
    }
  }

  /**
   * Alkalmazás frissítése
   */
  async updateApp() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        // Service Worker frissítés
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Oldal újratöltése
        window.location.reload();
      } catch (error) {
        console.error('[PWA] Frissítési hiba:', error);
      }
    }
  }

  /**
   * Offline státus ellenőrzése
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Online státus figyelése
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Cache törlése
   */
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[PWA] Cache törölve');
      } catch (error) {
        console.error('[PWA] Cache törlési hiba:', error);
      }
    }
  }

  /**
   * Push notification regisztrálása
   */
  async registerPushNotification(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PWA] Push notification nem támogatott');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });

      console.log('[PWA] Push notification regisztrálva');
      return subscription;
    } catch (error) {
      console.error('[PWA] Push notification regisztrálási hiba:', error);
      return null;
    }
  }

  /**
   * Push notification regisztráció törlése
   */
  async unregisterPushNotification(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[PWA] Push notification regisztráció törölve');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Push notification törlési hiba:', error);
      return false;
    }
  }

  /**
   * Service Worker üzenetek kezelése
   */
  private handleServiceWorkerMessage(data: any) {
    console.log('[PWA] Service Worker üzenet:', data);
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.dispatchEvent('cacheUpdated', data);
        break;
      case 'OFFLINE_DATA_SYNCED':
        this.dispatchEvent('offlineDataSynced', data);
        break;
      default:
        console.log('[PWA] Ismeretlen üzenet típus:', data.type);
    }
  }

  /**
   * Custom események küldése
   */
  private dispatchEvent(type: string, detail: any) {
    const event = new CustomEvent(`pwa:${type}`, { detail });
    window.dispatchEvent(event);
  }

  /**
   * VAPID kulcs konvertálása
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * PWA státus lekérése
   */
  getStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.installPrompt,
      isOffline: this.isOffline(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushSupport: 'PushManager' in window,
    };
  }

  /**
   * PWA konfiguráció lekérése
   */
  getConfig(): PWAConfig {
    return this.config;
  }
}

/**
 * Hook a PWA manager használatához
 */
export function usePWAManager(config: PWAConfig) {
  const [pwaManager] = useState(() => new PWAManager(config));
  const [status, setStatus] = useState(pwaManager.getStatus());

  useEffect(() => {
    // Státus frissítése
    const updateStatus = () => setStatus(pwaManager.getStatus());
    
    // Online státus figyelése
    const cleanupOnlineStatus = pwaManager.onOnlineStatusChange(() => {
      updateStatus();
    });

    // Custom események figyelése
    const handleInstallPrompt = () => updateStatus();
    const handleAppInstalled = () => updateStatus();
    const handleUpdateAvailable = () => updateStatus();

    window.addEventListener('pwa:installPromptAvailable', handleInstallPrompt);
    window.addEventListener('pwa:appInstalled', handleAppInstalled);
    window.addEventListener('pwa:updateAvailable', handleUpdateAvailable);

    return () => {
      cleanupOnlineStatus();
      window.removeEventListener('pwa:installPromptAvailable', handleInstallPrompt);
      window.removeEventListener('pwa:appInstalled', handleAppInstalled);
      window.removeEventListener('pwa:updateAvailable', handleUpdateAvailable);
    };
  }, [pwaManager]);

  return {
    pwaManager,
    status,
    install: () => pwaManager.install(),
    updateApp: () => pwaManager.updateApp(),
    clearCache: () => pwaManager.clearCache(),
    registerPushNotification: () => pwaManager.registerPushNotification(),
    unregisterPushNotification: () => pwaManager.unregisterPushNotification(),
  };
}
