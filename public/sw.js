const CACHE_STATIC  = "yawmi-static-v13";
const CACHE_PAGES   = "yawmi-pages-v13";
const CACHE_API     = "yawmi-api-v13";

// Assets statiques toujours en cache
const STATIC_ASSETS = [
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-96x96.png",
  "/audio/adhan-alafasy.mp3",
  "/audio/adhan-husary.mp3",
  "/audio/adhan-abdulbasit.mp3",
  "/audio/adhan-thobaity.mp3",
  "/offline.html",
];

// Pages shell à mettre en cache (SPA navigation)
const SHELL_PAGES = [
  "/accueil",
  "/prieres",
  "/dhikr",
  "/azkar",
  "/coran",
  "/qibla",
  "/profil",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_STATIC, CACHE_PAGES, CACHE_API].includes(k))
          .map((k) => caches.delete(k))
      )
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
      tag:   "yawmi-notif",
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

// ── Stratégie fetch ───────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Assets statiques → cache d'abord
  if (STATIC_ASSETS.some(a => url.pathname === a)) {
    event.respondWith(
      caches.match(event.request).then(cached => cached ?? fetch(event.request))
    );
    return;
  }

  // 2. API Quran → réseau d'abord, cache en fallback (stale-while-revalidate)
  if (url.hostname === "api.alquran.cloud") {
    event.respondWith(
      caches.open(CACHE_API).then(async cache => {
        try {
          const fresh = await fetch(event.request.clone());
          if (fresh.ok) cache.put(event.request, fresh.clone());
          return fresh;
        } catch {
          return cache.match(event.request);
        }
      })
    );
    return;
  }

  // 3. Pages Next.js → réseau d'abord, cache shell en fallback
  if (url.origin === self.location.origin && !url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request.clone())
        .then(res => {
          if (res.ok && SHELL_PAGES.some(p => url.pathname.startsWith(p))) {
            caches.open(CACHE_PAGES).then(c => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // Fallback offline
          const offline = await caches.match("/offline.html");
          return offline ?? new Response("Hors-ligne", { status: 503 });
        })
    );
    return;
  }
});
