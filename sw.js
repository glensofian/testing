const APP_CACHE = 'app-shell-v1';
const RUNTIME_CACHE = 'runtime-v1';
const APP_SHELL = [
  '/', '/index.html', '/bundle.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(APP_SHELL);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== APP_CACHE && k !== RUNTIME_CACHE) ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const isStories = request.url.includes('/v1/stories');
  if (isStories) {
    event.respondWith((async () => {
      try {
        const net = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, net.clone());
        return net;
      } catch {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        return cached || new Response(JSON.stringify({ error: true, message: 'offline' }), { headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(request);
        const cache = await caches.open(APP_CACHE);
        cache.put('/', net.clone());
        return net;
      } catch {
        const cache = await caches.open(APP_CACHE);
        return cache.match('/index.html');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const netPromise = fetch(request).then((resp) => {
      cache.put(request, resp.clone());
      return resp;
    }).catch(() => cached);
    return cached || netPromise;
  })());
});


self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }

  const title = payload.title || 'Story berhasil dibuat';
  const options = payload.options || { body: 'Story baru berhasil dibuat.' };

  event.waitUntil(self.registration.showNotification(title, {
    ...options,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window' });
    for (const c of all) {
      if ('focus' in c) { c.focus(); return; }
    }
    if (clients.openWindow) clients.openWindow('/#/home');
  })());
});
