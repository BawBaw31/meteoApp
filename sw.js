// sw.js

// install event
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('meteo')
        .then((cache) => {
          return cache.addAll([
            'index.html',
            'css/main.css',
            'js/index.js',
            'manifest.json'
         ]);
        })
        .then(() => {
          return self.skipWaiting();
        })
    );
  });
  
  // fetch event
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });