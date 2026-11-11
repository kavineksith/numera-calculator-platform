// public/sw.js
// Service worker for offline shell caching.
// Caches the main HTML, CSS, and JS bundles so the calculator UI remains
// usable without a network connection. The math engine is pure client-side
// JS so calculations always work offline.
//
// NOTE: API calls (history, themes, settings, images, recovery) require
// the Node.js server to be running. When offline, the calculator queues
// history writes to localStorage and syncs on reconnect.

const CACHE_NAME = "calc-platform-v1";
const PRECACHE_URLS = ["/", "/globals.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle GET requests.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Never cache API responses — they may include user-specific data.
  if (url.pathname.startsWith("/api/")) return;

  // For navigations, try network first (so dev server changes show up),
  // fall back to cache when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/")))
    );
    return;
  }

  // For static assets: cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      });
    })
  );
});
