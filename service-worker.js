const CACHE_NAME = 'my-cache-v2';
const URLS_TO_CACHE = [
  'available/', 
  'available/home.html', // Ensure correct path
];

// Install event: Cache assets when service worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        URLS_TO_CACHE.map(url =>
          fetch(url, { cache: "no-store" }) // Avoid caching errors
            .then(response => {
              if (!response.ok) throw new Error(`Failed to fetch ${url}`);
              return cache.put(url, response);
            })
            .catch(error => console.warn('Caching failed for', url, error))
        )
      );
    })
  );
});

// Fetch event: Serve from cache first, then update from network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // Ignore non-GET requests (e.g., POST)

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Only cache static assets (avoid caching API responses)
        if (event.request.destination !== 'document') {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // If offline, return cached home.html as fallback
      return caches.match('/home.html');
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
