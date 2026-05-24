/* Product Phase 21-C — Client portal service worker (shell-only cache · denylist). */
const CACHE_VERSION = "aibeopchin-client-portal-pwa-v1";
const SHELL_URLS = ["/client/offline", "/manifest.webmanifest", "/pwa/client-portal-icon.svg"];

const CACHE_DENYLIST = [
  "/api/",
  "/login",
  "/client/cases/",
  "files/upload",
  "shared-documents",
  "supplement-requests",
  "submissions",
  "messages",
  "deadlines",
  "document",
  "attachment",
  "push-subscriptions",
  "notification-preferences",
  "notifications",
];

function isCacheDenied(pathname) {
  const lower = pathname.toLowerCase();
  return CACHE_DENYLIST.some((term) => lower.includes(term.toLowerCase()));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("aibeopchin-client-portal-pwa-") && key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isCacheDenied(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match("/client/offline")) || Response.error();
      }),
    );
    return;
  }

  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }),
    );
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {
        title: "AI법친 의뢰인 포털",
        body: "새 알림이 있습니다. 보안 포털에서 확인해 주세요.",
        url: "/client/cases?source=pwa",
        tag: "aibeopchin-client-portal",
      };

      try {
        if (event.data) {
          const parsed = event.data.json();
          if (parsed && typeof parsed === "object") {
            payload = { ...payload, ...parsed };
          }
        }
      } catch (_) {
        /* metadata-only fallback */
      }

      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/pwa/client-portal-icon.svg",
        badge: "/pwa/client-portal-icon.svg",
        tag: payload.tag,
        data: { url: payload.url },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/client/cases?source=pwa";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client && client.url.includes("/client/")) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
