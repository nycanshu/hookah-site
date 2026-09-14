// Cache the big immutable assets (models, MediaPipe runtime) so repeat visits start instantly.
// App code and HTML always go to the network first, so updates show up right away.
const CACHE = "hookah-assets-v1";
const isAsset = (url) => url.includes("/models/") || url.includes("cdn.jsdelivr.net/npm/@mediapipe/tasks-vision");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !isAsset(e.request.url)) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(e.request);
    if (hit) return hit;
    const res = await fetch(e.request);
    if (res.ok && (res.type === "basic" || res.type === "cors")) cache.put(e.request, res.clone());
    return res;
  }));
});
