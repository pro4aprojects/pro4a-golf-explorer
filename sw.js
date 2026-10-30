/* PRO4A Golf Explorer — offline cache */
var CACHE = 'pro4a-golf-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.png',
  './hero.jpg',
  './featured.jpg',
  './course1.jpg',
  './course2.jpg',
  './course3.jpg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (res) {
        // Cache successful same-origin and font responses for offline use
        try {
          var url = new URL(e.request.url);
          var cacheable = res && res.status === 200 &&
            (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname));
          if (cacheable) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          }
        } catch (err) {}
        return res;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
