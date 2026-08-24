/* Offline cache for IMCELER Pinball.
 *
 * The game is one self-contained file, so "offline" just means holding on to
 * index.html and the icons. Bump CACHE when the game changes: the old cache is
 * dropped on activate, so players get the new build instead of a stale one.
 */
const CACHE = "imceler-pinball-v3";
const ASSETS = ["./", "./index.html", "./icon-192.png", "./icon-512.png", "./manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, falling back to cache: an update is picked up as soon as the
// player is online, and the game still starts on a plane.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
