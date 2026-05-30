const CACHE_NAME = 'wot-map-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/logo.png',
  '/legend_crop.png'
];

// Install Event: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: network-first for api, cache-first for static files and huge map image
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip caching POST requests (like save locations) or Chrome extensions
  if (event.request.method !== 'GET' || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
    return;
  }

  // API/Firestore Requests: Network-first to ensure live data updates are always visible
  if (url.pathname.startsWith('/api/') || url.pathname.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static Assets and big Map Image: Cache-first, then network and cache dynamically
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        // Cache newly fetched assets dynamically (including the huge afavl8.jpeg map image!)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        console.error('[Service Worker] Fetch failed:', err);
      });
    })
  );
});
