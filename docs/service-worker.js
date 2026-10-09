const APP_BASE_URL = new URL(self.registration.scope);
const appUrl = (path) => new URL(path, APP_BASE_URL).href;
const APP_BASE_PATH = APP_BASE_URL.pathname;
const CACHE_NAME = "curiousbooster-shell-v3";
const APP_SHELL = [
  "index.html",
  "lesson.html",
  "quiz.html",
  "styles.css",
  "app-client.js",
  "credits.js",
  "lesson-page.js",
  "quiz-page.js",
  "pwa.js",
  "manifest.webmanifest",
  "assets/ambitious-science-icon-180.png",
  "assets/ambitious-science-icon-192.png",
  "assets/ambitious-science-icon-512.png",
  "assets/ambitious-science-icon.svg",
  "assets/curiousbooster-science-logo.svg",
  "assets/icon-photo-laptop-books.jpg",
  "assets/icon-photo-fire.jpg",
  "assets/icon-photo-water-splash.jpg"
];
const SERVER_ONLY_FILES = [];
const DEMO_ONLY_FILES = ["curriculum.json"];
const APP_SHELL_URLS = [...APP_SHELL, ...SERVER_ONLY_FILES, ...DEMO_ONLY_FILES].map(appUrl);
const PAGE_PATHS = new Set([
  APP_BASE_PATH,
  "index.html",
  "lesson.html",
  "quiz.html",
  "payment-return.html"
].map((path) => new URL(path, APP_BASE_URL).pathname));
const API_PATH = new URL("api/", APP_BASE_URL).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
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
    requestUrl.origin !== APP_BASE_URL.origin ||
    requestUrl.pathname.startsWith(API_PATH)
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
          return cachedPage || caches.match(appUrl("index.html"));
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
        /^(text\/(css|javascript|html)|application\/(javascript|json|manifest\+json)|image\/)/i.test(contentType)
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
