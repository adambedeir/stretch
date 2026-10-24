/* Offline support. Network first (so updates show up right away), cache as fallback.
 * Bump VERSION when shipping changes so old caches get cleared. */
const VERSION = 'stretch-v2.2.0';
const FILES = [
  './',
  './index.html',
  './css/app.css',
  './js/figure.js',
  './js/stretches.js',
  './js/bodymap.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 3000));
      const res = await Promise.race([fetch(req), timeout]);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') return cache.match('./index.html');
      throw err;
    }
  })());
});
