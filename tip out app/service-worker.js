const CACHE_NAME = 'tip-tracker-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html', // Explicitly caching index.html
  '/index.tsx',
  '/App.tsx',
  '/components/Input.tsx',
  '/components/DisplayCard.tsx',
  '/components/Calendar.tsx',
  '/components/TipModal.tsx',
  '/constants.ts',
  '/types.ts',
  'https://cdn.tailwindcss.com',
  'https://rsms.me/inter/inter.css',
  'https://images.ctfassets.net/ih31w4gbf9hm/63JgCjzZG6eJYLUwlhpdx2/1f33b250c87f9d60924ad5095cb3637b/anejo_logo.jpg',
  // URLs from importmap. Note: Exact URLs resolved by esm.sh might vary.
  // A build step would make caching these more robust.
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client', // Assuming this is the main entry from react-dom
  // Icons (referenced in manifest.json, ensure these paths are correct and files exist)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all URLs to cache. If any request fails, caching fails.
        // For external URLs, ensure they support CORS or use appropriate request modes if necessary.
        const promises = URLS_TO_CACHE.map(url => {
          const request = new Request(url, { mode: 'cors' }); // Attempt CORS for all
          return fetch(request).then(response => {
            if (!response.ok && url.startsWith('http')) { // Check only external URLs more strictly
              // Don't fail the entire cache for optional external resources if they fail (e.g. CDN down)
              // Or, if it's critical, let it fail: throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
              console.warn(`Failed to fetch ${url} for caching, status: ${response.status}`);
              return Promise.resolve(); // Continue without this resource
            }
            // For local resources or successful fetches, cache them.
            if (response.ok || !url.startsWith('http')) {
                 return cache.put(url.startsWith('http') ? request : url, response);
            }
            return Promise.resolve();
          }).catch(err => {
            console.warn(`Error fetching ${url} for caching:`, err);
            return Promise.resolve(); // Continue without this resource
          });
        });
        return Promise.all(promises);
      })
      .then(() => self.skipWaiting()) // Activate new service worker immediately
      .catch(err => {
        console.error('Cache open/addAll failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of uncontrolled clients
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // Don't cache error responses or opaque responses unless intended
              // For 'basic' type, it's same-origin. Cross-origin (type 'cors') can be cached.
              // Opaque responses (type 'opaque') have limitations.
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch failed; returning offline page or error.', error);
          // Optionally, return a generic offline page if the request is for navigation
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // You'd need an offline.html cached
          // }
        });
      })
  );
});
