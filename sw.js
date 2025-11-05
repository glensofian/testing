const APP_CACHE = 'app-shell-v1';
const RUNTIME_CACHE = 'runtime-v1';

const BASE = (self.registration?.scope || '/').replace(location.origin, '');

const APP_SHELL = [
  `${BASE}`, `${BASE}index.html`, `${BASE}bundle.js`,
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  `${BASE}manifest.webmanifest`,
  `${BASE}icons/icon-192.png`, `${BASE}icons/icon-512.png`,
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

  if (request.url.includes('/v1/stories')) {
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
        cache.put(`${BASE}`, net.clone());
        return net;
      } catch {
        const cache = await caches.open(APP_CACHE);
        return (await cache.match(`${BASE}index.html`)) || (await cache.match('index.html'));
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
  console.log('Service Worker menerima push notification');

  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Story baru dari Story App';
  const options = {
    body: data.options?.body || 'Ada cerita baru! Yuk cek sekarang.',
    icon: data.options?.icon || '/icons/icon-192.png',
    badge: data.options?.badge || '/icons/icon-192.png',
    data: {
      url: '/#/home',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindow = clientsArr.find((c) => c.url.includes('/#/home') && 'focus' in c);
      if (hadWindow) return hadWindow.focus();
      if (clients.openWindow) return clients.openWindow('/#/home');
    })
  );
});
