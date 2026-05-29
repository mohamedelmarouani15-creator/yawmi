const CACHE = "yawmi-v12";

// On ne cache QUE les icônes statiques — jamais les pages HTML/JS
const STATIC_ASSETS = [
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push notifications ────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Yawmi", {
      body:  data.body ?? "",
      icon:  "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data:  { url: data.url ?? "/famille" },
      tag:   "yawmi-duel",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/famille";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

// Réseau d'abord, cache uniquement pour les assets statiques en fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isStaticAsset = STATIC_ASSETS.some(a => url.pathname === a);
  if (!isStaticAsset) return; // laisse le navigateur gérer
  event.respondWith(
    caches.match(event.request).then(cached => cached ?? fetch(event.request))
  );
});
