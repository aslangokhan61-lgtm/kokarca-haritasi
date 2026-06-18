const CACHE_NAME = 'kokarca-haritasi-v59';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './kurulum_brosuru.html',
  './salim_rehberi.html',
  './uygulama_talimati.html',
  './manifest.json',
  './veri/lokasyonlar.json',
  './resimler/icon.png',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap'
];

// Install Event - Pre-caches critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate strategy for online speed & offline support
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests (avoid chrome-extension or other schemes)
  if (!event.request.url.startsWith('http')) return;

  // Workaround for Safari WebKitBlobResource error 1:
  // WebKit tarayıcıları önbelleğe alınmış kaynakları alırken hata veriyor.
  // WebKit üzerinde Servis Çalışanı önbelleğini devre dışı bırakıyoruz.
  const isSafari = typeof navigator !== 'undefined' && navigator.userAgent && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    return; // Tarayıcının varsayılan ağ davranışına geri dön
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached resource immediately, but fetch update in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background fetch errors (e.g. if offline)
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache the new resource for future offline use
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        console.log('[Service Worker] Fetch failed, network unavailable', err);
      });
    })
  );
});
