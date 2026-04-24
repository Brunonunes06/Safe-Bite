// Service Worker - Safe-Bite Netlify
const CACHE_NAME = 'safe-bite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
  '/settings.html',
  '/scanner.html',
  '/history.html',
  '/help.html',
  '/payment.html',
  '/login.html',
  '/signup.html',
  '/privacy.html',
  '/style.css',
  '/upgrade-popup.css',
  '/payment-brazil.css',
  '/api-config.js',
  '/script.js',
  '/user-sync.js',
  '/user-sync-integration.js',
  '/login-system.js',
  '/contact-system.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
