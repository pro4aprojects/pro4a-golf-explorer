/* PRO4A Golf Explorer — offline cache */
var CACHE = 'pro4a-golf-v2';
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
  './course4.jpg',
  './course5.jpg',
  './tagaytay-highlands.jpg',
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

function cachePut(request, response) {
  try {
    var url = new URL(request.url);
    var cacheable = response && response.status === 200 &&
      (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname));
    if (cacheable) {
      var copy = response.clone();
      caches.open(CACHE).then(function (c) { c.put(request, copy); });
    }
  } catch (err) {}
  return response;
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    // Network-first for the app page itself, so updates arrive right away; cache keeps it working offline
    e.respondWith(
      fetch(e.request).then(function (res) { return cachePut(e.request, res); })
        .catch(function () {
          return caches.match(e.request, { ignoreSearch: true }).then(function (c) { return c || caches.match('./index.html'); });
        })
    );
    return;
  }
  // Cache-first for assets (photos, icons, fonts)
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (res) { return cachePut(e.request, res); });
    })
  );
});
