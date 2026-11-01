// BLIS Navigator: network-only client dashboards.
// A previous offline fallback served the cached Aroma dashboard when a requested
// client route was unavailable. Never substitute one client's cached HTML for another.
const CACHE = 'blis-navigator-pwa-v3-no-client-fallback';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('blis-navigator-pwa-')).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never cache or fall back for navigation, API data, or application assets.
  // Network failure must be visible, not silently replaced by Aroma.
  if (req.mode === 'navigate' || url.pathname.startsWith('/api/')) return;
});
