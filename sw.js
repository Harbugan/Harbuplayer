// GroovePlayer Service Worker
// Caches the app shell so the player loads instantly and works offline.

var CACHE = 'grooveplayer-v1';

// Files that make up the app shell
var SHELL = ['./'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', function(e) {
  // Remove old cache versions
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  // Let external API calls (iTunes artwork) go straight to the network
  var url = e.request.url;
  if (url.includes('itunes.apple.com') || url.startsWith('blob:')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      // Network-first for navigation (always get latest app version),
      // then fall back to cache if offline.
      var network = fetch(e.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return cached; // Serve from cache when offline
      });

      // Return cache immediately if available, update in background
      return cached || network;
    })
  );
});
