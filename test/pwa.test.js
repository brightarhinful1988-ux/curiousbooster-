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
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192" && icon.type === "image/png"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512" && icon.type === "image/png"));
  assert.ok(manifest.icons.some((icon) => icon.src === "/assets/ambitious-science-icon.svg"));
  for (const size of [180, 192, 512]) {
    const iconSize = size === 180 ? "180" : String(size);
    const icon = fs.readFileSync(path.join(APP_DIRECTORY, "assets", `ambitious-science-icon-${iconSize}.png`));
    assert.equal(icon.readUInt32BE(0), 0x89504e47);
    assert.equal(icon.readUInt32BE(16), size);
    assert.equal(icon.readUInt32BE(20), size);
  }
  assert.match(
    fs.readFileSync(path.join(APP_DIRECTORY, "assets", "ambitious-science-icon.svg"), "utf8"),
    /AMBITIOUS/
  );
  assert.match(fs.readFileSync(path.join(APP_DIRECTORY, "pwa.js"), "utf8"), /beforeinstallprompt/);
  assert.match(fs.readFileSync(path.join(APP_DIRECTORY, "index.html"), "utf8"), /Install \/ Download the App/);
  assert.match(fs.readFileSync(path.join(APP_DIRECTORY, "index.html"), "utf8"), /install-app-help/);
});

test("service worker caches the static shell but leaves API requests online-only", async () => {
  const listeners = new Map();
  const precachedPaths = [];
  const cacheLookups = [];
  const cachedHome = { offline: "home" };
  const appScope = "https://curiousbooster.test/curiousbooster-/";
  const homePath = `${appScope}index.html`;
  const cache = {
    addAll: async (paths) => precachedPaths.push(...paths),
    put: async () => {}
  };
  const self = {
    registration: { scope: appScope },
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
      return request === homePath ? cachedHome : null;
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
  assert.ok(precachedPaths.includes(`${appScope}index.html`));
  assert.ok(precachedPaths.includes(`${appScope}assets/icon-photo-fire.jpg`));
  assert.ok(precachedPaths.every((item) => !new URL(item).pathname.startsWith("/curiousbooster-/api/")));

  let apiWasIntercepted = false;
  listeners.get("fetch")({
    request: {
      method: "GET",
      mode: "cors",
      url: `${appScope}api/me`
    },
    respondWith: () => { apiWasIntercepted = true; }
  });
  assert.equal(apiWasIntercepted, false);

  let offlineNavigation;
  listeners.get("fetch")({
    request: {
      method: "GET",
      mode: "navigate",
      url: `${appScope}lesson.html?subject=BIOLOGY`
    },
    respondWith: (promise) => { offlineNavigation = promise; }
  });
  assert.equal(await offlineNavigation, cachedHome);
  assert.ok(cacheLookups.some((request) => request === homePath));
});
