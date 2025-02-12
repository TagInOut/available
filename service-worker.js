const CACHE_NAME = 'my-cache-v1';
const URLS_TO_CACHE = [
  '/', // Cache the homepage
  'available//home.html', // Ensure this is cached
  'available//list.json', // Example styles
  'available//installations', // Example script
];

// Install event: Cache assets when the service worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone()); // Update cache
          return networkResponse;
        });
      });
    }).catch(() => {
      return caches.match('/index.html'); // Fallback to cached page if offline
    })
  );
});

// Activate event: Remove old caches when a new version is installed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME).map(cacheName => caches.delete(cacheName))
      );
    })
  );
});
