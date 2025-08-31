/**
 * ProTipp V2 Service Worker
 * Offline cache-elés és PWA funkcionalitás
 */

const CACHE_NAME = 'protip-v2-cache-v1';
const STATIC_CACHE_NAME = 'protip-v2-static-v1';
const DYNAMIC_CACHE_NAME = 'protip-v2-dynamic-v1';

// Cache-elendő statikus erőforrások
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

// API végpontok, amelyeket cache-elünk
const API_CACHE_PATTERNS = [
  /\/api\/v1\/arbitrage/,
  /\/api\/v1\/odds/,
  /\/api\/v1\/analytics/,
];

// Network first stratégia API hívásokhoz
const NETWORK_FIRST_STRATEGY = 'network-first';
// Cache first stratégia statikus erőforrásokhoz
const CACHE_FIRST_STRATEGY = 'cache-first';
// Stale while revalidate stratégia
const STALE_WHILE_REVALIDATE_STRATEGY = 'stale-while-revalidate';

/**
 * Service Worker telepítés
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker telepítése...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Statikus erőforrások cache-elése...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker telepítve');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Telepítési hiba:', error);
      })
  );
});

/**
 * Service Worker aktiválás
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker aktiválása...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Régi cache-ek törlése
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Régi cache törlése:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker aktiválva');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch esemény kezelése
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Csak GET kérések cache-elése
  if (request.method !== 'GET') {
    return;
  }

  // API hívások kezelése
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Statikus erőforrások kezelése
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // HTML oldalak kezelése
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleHtmlRequest(request));
    return;
  }

  // Egyéb erőforrások
  event.respondWith(handleOtherRequest(request));
});

/**
 * API kérés kezelése (Network First)
 */
async function handleApiRequest(request) {
  try {
    // Először próbáljuk a hálózatot
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Sikeres válasz cache-elése
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Hálózati hiba, cache-ből betöltés...');
  }

  // Cache-ből betöltés
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Offline válasz
  return new Response(
    JSON.stringify({ 
      error: 'Offline mód', 
      message: 'Nincs internetkapcsolat' 
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Statikus erőforrás kezelése (Cache First)
 */
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Statikus erőforrás betöltési hiba:', error);
    return new Response('Erőforrás nem elérhető', { status: 404 });
  }
}

/**
 * HTML kérés kezelése (Stale While Revalidate)
 */
async function handleHtmlRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Cache-ből azonnal visszaadás (ha van)
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Hálózati hiba esetén offline oldal
      return cache.match('/offline.html');
    });

  return cachedResponse || fetchPromise;
}

/**
 * Egyéb kérések kezelése
 */
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Sikeres válaszok cache-elése
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Cache-ből betöltés hiba esetén
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Erőforrás nem elérhető', { status: 404 });
  }
}

/**
 * API kérés ellenőrzése
 */
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Statikus erőforrás ellenőrzése
 */
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

/**
 * Push notification kezelése
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification érkezett');
  
  const options = {
    body: event.data?.text() || 'Új értesítés a ProTipp V2-ből',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Megnyitás',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Bezárás',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ProTipp V2', options)
  );
});

/**
 * Notification click kezelése
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification kattintás');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Background sync kezelése
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Background sync végrehajtása
 */
async function doBackgroundSync() {
  try {
    // Offline adatok szinkronizálása
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      await syncDataToServer(data);
    }
    
    console.log('[SW] Background sync sikeres');
  } catch (error) {
    console.error('[SW] Background sync hiba:', error);
  }
}

/**
 * Offline adatok lekérése
 */
async function getOfflineData() {
  // IndexedDB-ből offline adatok lekérése
  // Implementáció a kliens oldalon történik
  return [];
}

/**
 * Adatok szinkronizálása a szerverrel
 */
async function syncDataToServer(data) {
  // API hívás a szerverrel való szinkronizáláshoz
  // Implementáció a kliens oldalon történik
}

/**
 * Message kezelése a klienssel
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message érkezett:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

console.log('[SW] Service Worker betöltve');
