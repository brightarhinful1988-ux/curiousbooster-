const CACHE_NAME = "curiousbooster-shell-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/lesson.html",
  "/quiz.html",
  "/payment-return.html",
  "/styles.css",
  "/app-client.js",
  "/credits.js",
  "/lesson-page.js",
  "/quiz-page.js",
  "/payment-return.js",
  "/pwa.js",
  "/manifest.webmanifest",
  "/assets/curiousbooster-icon.svg",
  "/assets/curiousbooster-science-logo.svg",
  "/assets/icon-photo-laptop-books.jpg",
  "/assets/icon-photo-fire.jpg",
  "/assets/icon-photo-water-splash.jpg"
];
const PAGE_PATHS = new Set([
  "/",
  "/index.html",
  "/lesson.html",
  "/quiz.html",
  "/payment-return.html"
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("curiousbooster-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);
  if (
    request.method !== "GET" ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname.startsWith("/api/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && PAGE_PATHS.has(requestUrl.pathname)) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request, { ignoreSearch: true });
          return cachedPage || caches.match("/index.html");
        })
    );
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    const networkUpdate = fetch(request).then((response) => {
      const contentType = response.headers.get("content-type") || "";
      if (
        response.ok &&
        response.type === "basic" &&
        /^(text\/(css|javascript|html)|application\/(javascript|manifest\+json)|image\/)/i.test(contentType)
      ) {
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
      }
      return response;
    });
    if (cached) {
      event.waitUntil(networkUpdate.catch(() => undefined));
      return cached;
    }
    return networkUpdate;
  })());
});
