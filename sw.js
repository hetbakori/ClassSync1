const CACHE_NAME = 'classsync-v6';
const urlsToCache = [
  'index.html',
  'feature.html',
  'dashboard.html',
  'style.css',
  'script.js',
  'logo.png'
];

// Install the service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});