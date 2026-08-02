/**
 * RxFlow Service Worker v4.0
 * Network-first for localhost development to prevent stale cache switching
 */

const CACHE_NAME = 'rxflow-v4.0';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/rxflow-logo.png'
];

// Install — cache app shell & skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate — immediately delete all old caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network-first for dev/API, cache fallback for offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API requests: network only
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // On localhost or standard navigation: Network-first to always serve fresh code
  if (isLocalhost || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Static assets offline fallback: Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Web Push — handle incoming push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'RxFlow PWA';
  const options = {
    body: data.body || 'New notification',
    icon: '/rxflow-logo.png',
    badge: '/rxflow-logo.png',
    tag: data.tag || 'rxflow-notification',
    data: data.url || '/',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click — open app to specific route
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
