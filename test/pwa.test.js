const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const APP_DIRECTORY = path.join(__dirname, "..");

test("web manifest describes an installable CURIOUSBOOSTER app", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(APP_DIRECTORY, "manifest.webmanifest"), "utf8")
  );
  assert.equal(manifest.name, "CURIOUSBOOSTER — Learn Science");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.type === "image/svg+xml"));
});

test("service worker caches the static shell but leaves API requests online-only", async () => {
  const listeners = new Map();
  const precachedPaths = [];
  const cacheLookups = [];
  const cachedHome = { offline: "home" };
  const cache = {
    addAll: async (paths) => precachedPaths.push(...paths),
    put: async () => {}
  };
  const self = {
    location: { origin: "https://curiousbooster.test" },
    addEventListener: (name, listener) => listeners.set(name, listener),
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  };
  const caches = {
    open: async () => cache,
    keys: async () => [],
    delete: async () => true,
    match: async (request) => {
      cacheLookups.push(request);
      return request === "/index.html" ? cachedHome : null;
    }
  };
  const networkFetch = async () => {
    throw new Error("offline");
  };
  const script = fs.readFileSync(path.join(APP_DIRECTORY, "service-worker.js"), "utf8");
  vm.runInNewContext(script, { self, caches, fetch: networkFetch, URL, Promise });

  let installPromise;
  listeners.get("install")({ waitUntil: (promise) => { installPromise = promise; } });
  await installPromise;
  assert.ok(precachedPaths.includes("/index.html"));
  assert.ok(precachedPaths.includes("/assets/icon-photo-fire.jpg"));
  assert.ok(precachedPaths.every((item) => !item.startsWith("/api/")));

  let apiWasIntercepted = false;
  listeners.get("fetch")({
    request: {
      method: "GET",
      mode: "cors",
      url: "https://curiousbooster.test/api/me"
    },
    respondWith: () => { apiWasIntercepted = true; }
  });
  assert.equal(apiWasIntercepted, false);

  let offlineNavigation;
  listeners.get("fetch")({
    request: {
      method: "GET",
      mode: "navigate",
      url: "https://curiousbooster.test/lesson.html?subject=BIOLOGY"
    },
    respondWith: (promise) => { offlineNavigation = promise; }
  });
  assert.equal(await offlineNavigation, cachedHome);
  assert.ok(cacheLookups.some((request) => request === "/index.html"));
});
