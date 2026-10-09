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
  assert.match(fs.readFileSync(path.join(APP_DIRECTORY, "pwa.js"), "utf8"), /display-mode: standalone/);
  assert.match(fs.readFileSync(path.join(APP_DIRECTORY, "index.html"), "utf8"), /Install \/ Download the App/);
  assert.match(fs.readFileSync(path.join(APP_DIRECTORY, "index.html"), "utf8"), /install-app-help/);
});

test("install button hides after installation and in standalone app mode", () => {
  const script = fs.readFileSync(path.join(APP_DIRECTORY, "pwa.js"), "utf8");
  const windowListeners = new Map();
  const buttonListeners = new Map();
  const displayModeListeners = new Map();
  const button = {
    hidden: true,
    disabled: false,
    addEventListener: (name, listener) => buttonListeners.set(name, listener)
  };
  const help = { hidden: true };
  const displayMode = {
    matches: false,
    addEventListener: (name, listener) => displayModeListeners.set(name, listener)
  };
  const window = {
    addEventListener: (name, listener) => windowListeners.set(name, listener),
    matchMedia: () => displayMode
  };
  const navigator = {};
  const document = {
    documentElement: { dataset: { publicDemo: "true" } },
    querySelector: (selector) => selector === "#install-app-button" ? button : help
  };

  vm.runInNewContext(script, { window, navigator, document, URL, console });
  assert.equal(button.hidden, false);
  windowListeners.get("appinstalled")();
  assert.equal(button.hidden, true);
  assert.equal(help.hidden, true);

  button.hidden = false;
  displayMode.matches = true;
  displayModeListeners.get("change")({ matches: true });
  assert.equal(button.hidden, true);

  const standaloneButton = { ...button, hidden: false };
  const standaloneWindow = { ...window, matchMedia: () => ({ matches: true }) };
  const standaloneDocument = {
    ...document,
    querySelector: (selector) => selector === "#install-app-button" ? standaloneButton : help
  };
  vm.runInNewContext(script, {
    window: standaloneWindow,
    navigator,
    document: standaloneDocument,
    URL,
    console
  });
  assert.equal(standaloneButton.hidden, true);
});

test("service worker caches the static shell but leaves API requests online-only", async () => {
  const listeners = new Map();
  const precachedPaths = [];
  const cacheLookups = [];
  const networkRequests = [];
  const cachedHome = { offline: "home" };
  const cachedLesson = { offline: "lesson" };
  const appScope = "https://curiousbooster.test/curiousbooster-/";
  const homePath = `${appScope}index.html`;
  const lessonPath = `${appScope}lesson.html`;
  let failLessonRefresh;
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
      const requestUrl = typeof request === "string" ? request : request.url;
      const requestPath = requestUrl.split("?")[0];
      cacheLookups.push(requestUrl);
      return requestPath === homePath
        ? cachedHome
        : requestPath === lessonPath
          ? cachedLesson
          : null;
    }
  };
  const networkFetch = async (request) => {
    networkRequests.push(request.url);
    if (request.url.startsWith(lessonPath)) {
      return await new Promise((resolve, reject) => {
        failLessonRefresh = () => reject(new Error("offline"));
      });
    }
    throw new Error("offline");
  };
  const script = fs.readFileSync(path.join(APP_DIRECTORY, "service-worker.js"), "utf8");
  vm.runInNewContext(script, {
    self,
    caches,
    fetch: networkFetch,
    URL,
    Promise,
    console: { warn: () => {}, error: () => {} }
  });

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
  const backgroundRefreshes = [];
  listeners.get("fetch")({
    request: {
      method: "GET",
      mode: "navigate",
      url: `${lessonPath}?subject=BIOLOGY`
    },
    respondWith: (promise) => { offlineNavigation = promise; },
    waitUntil: (promise) => backgroundRefreshes.push(promise)
  });
  assert.equal(await offlineNavigation, cachedLesson);
  assert.deepEqual(networkRequests, [`${lessonPath}?subject=BIOLOGY`]);
  failLessonRefresh();
  await Promise.all(backgroundRefreshes);
  assert.deepEqual(networkRequests, [`${lessonPath}?subject=BIOLOGY`]);
  assert.ok(cacheLookups.some((request) => request === lessonPath + "?subject=BIOLOGY"));

  let uncachedNavigation;
  listeners.get("fetch")({
    request: {
      method: "GET",
      mode: "navigate",
      url: `${appScope}quiz.html`
    },
    respondWith: (promise) => { uncachedNavigation = promise; },
    waitUntil: () => {}
  });
  assert.equal(await uncachedNavigation, cachedHome);
  assert.deepEqual(networkRequests, [
    `${lessonPath}?subject=BIOLOGY`,
    `${appScope}quiz.html`
  ]);
  assert.ok(cacheLookups.includes(homePath));
});
