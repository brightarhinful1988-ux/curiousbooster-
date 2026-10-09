const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createApp, validateProductionConfig, verifyAndFulfill } = require("../server");

test("production config requires HTTPS and an absolute database path", () => {
  assert.throws(
    () => validateProductionConfig({
      NODE_ENV: "production",
      DATABASE_PATH: "/var/data/curiousbooster.sqlite"
    }),
    /APP_BASE_URL/
  );
  assert.throws(
    () => validateProductionConfig({
      NODE_ENV: "production",
      APP_BASE_URL: "http://curiousbooster.example",
      DATABASE_PATH: "/var/data/curiousbooster.sqlite"
    }),
    /HTTPS/
  );
  assert.throws(
    () => validateProductionConfig({
      NODE_ENV: "production",
      APP_BASE_URL: "https://curiousbooster.example"
    }),
    /DATABASE_PATH/
  );
  assert.throws(
    () => validateProductionConfig({
      NODE_ENV: "production",
      APP_BASE_URL: "https://curiousbooster.example",
      DATABASE_PATH: "/var/data/curiousbooster.sqlite",
      PAYSTACK_SECRET_KEY: "sk_live_not-supported"
    }),
    /not implemented/
  );
  assert.doesNotThrow(() => validateProductionConfig({
    NODE_ENV: "production",
    RENDER_EXTERNAL_URL: "https://curiousbooster.onrender.com",
    DATABASE_PATH: "/tmp/curiousbooster.sqlite"
  }));
});

test("accounts, credit purchases, and protected lesson unlocks", async (context) => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "curiousbooster-test-"));
  const app = createApp({
    appBaseUrl: "http://localhost:3000",
    databasePath: path.join(temporaryDirectory, "test.sqlite"),
    paystackSecretKey: ""
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  context.after(() => {
    server.close();
    app.locals.db.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const origin = { Origin: "http://localhost:3000" };
  const catalogueResponse = await fetch(`${baseUrl}/api/catalog`);
  const catalogue = await catalogueResponse.json();
  const lessons = catalogue.branches.flatMap((branch) => branch.lessons);
  assert.equal(catalogueResponse.status, 200);
  assert.equal(lessons.length, 89);
  assert.equal("intro" in lessons[0], false);

  const packagesResponse = await fetch(`${baseUrl}/api/packages`);
  const packages = await packagesResponse.json();
  assert.ok(packages.packages.every((item) => item.provisional));

  const sourceResponse = await fetch(`${baseUrl}/app.js`);
  assert.equal(sourceResponse.status, 404);

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: "ok" });

  const manifestResponse = await fetch(`${baseUrl}/manifest.webmanifest`);
  assert.equal(manifestResponse.status, 200);
  assert.match(manifestResponse.headers.get("content-type"), /application\/manifest\+json/);
  assert.equal((await manifestResponse.json()).start_url, "/");

  const serviceWorkerResponse = await fetch(`${baseUrl}/service-worker.js`);
  assert.equal(serviceWorkerResponse.status, 200);
  assert.equal(serviceWorkerResponse.headers.get("service-worker-allowed"), "/");
  assert.match(await serviceWorkerResponse.text(), /requestUrl\.pathname\.startsWith\("\/api\/"\)/);

  const homeResponse = await fetch(`${baseUrl}/`);
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(homeHtml, /id="install-app-button"/);

  const registrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { ...origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "learner@example.com", password: "a-long-test-password" })
  });
  assert.equal(registrationResponse.status, 201);
  assert.match(registrationResponse.headers.get("set-cookie"), /HttpOnly/);
  const registration = await registrationResponse.json();
  assert.equal(registration.credits, 0);
  assert.equal(registration.user.email, "learner@example.com");
  const cookie = registrationResponse.headers.get("set-cookie").split(";")[0];
  const sessionHeaders = { ...origin, Cookie: cookie, "Content-Type": "application/json" };

  const lockedContent = await fetch(`${baseUrl}/api/lessons/biology-cells/content`, {
    headers: sessionHeaders
  });
  assert.equal(lockedContent.status, 403);

  const noCreditsResponse = await fetch(`${baseUrl}/api/lessons/biology-cells/unlock`, {
    method: "POST",
    headers: sessionHeaders,
    body: "{}"
  });
  assert.equal(noCreditsResponse.status, 402);

  app.locals.db.prepare("UPDATE users SET credits = 2 WHERE email = ?")
    .run("learner@example.com");
  const unlockResponse = await fetch(`${baseUrl}/api/lessons/biology-cells/unlock`, {
    method: "POST",
    headers: sessionHeaders,
    body: "{}"
  });
  assert.equal(unlockResponse.status, 200);
  assert.equal((await unlockResponse.json()).credits, 1);

  const repeatUnlockResponse = await fetch(`${baseUrl}/api/lessons/biology-cells/unlock`, {
    method: "POST",
    headers: sessionHeaders,
    body: "{}"
  });
  const repeated = await repeatUnlockResponse.json();
  assert.equal(repeated.alreadyUnlocked, true);
  assert.equal(repeated.credits, 1);

  const unlockedContentResponse = await fetch(`${baseUrl}/api/lessons/biology-cells/content`, {
    headers: sessionHeaders
  });
  const unlockedContent = await unlockedContentResponse.json();
  assert.equal(unlockedContentResponse.status, 200);
  assert.equal(unlockedContent.lesson.id, "biology-cells");
  assert.equal(typeof unlockedContent.lesson.intro, "string");

  const checkoutResponse = await fetch(`${baseUrl}/api/payments/checkout`, {
    method: "POST",
    headers: sessionHeaders,
    body: JSON.stringify({ packageId: "starter" })
  });
  assert.equal(checkoutResponse.status, 503);

  const noOriginResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: "{}"
  });
  assert.equal(noOriginResponse.status, 403);

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: sessionHeaders,
    body: "{}"
  });
  assert.equal(logoutResponse.status, 204);
});

test("verified payments add credits once and reject amount mismatches", async (context) => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "curiousbooster-payment-test-"));
  const app = createApp({
    appBaseUrl: "http://localhost:3000",
    databasePath: path.join(temporaryDirectory, "test.sqlite")
  });
  const db = app.locals.db;
  context.after(() => {
    db.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  const created = db.prepare(`
    INSERT INTO users (email, password_salt, password_hash, credits, created_at)
    VALUES (?, '', '', 0, ?)
  `).run("payment@example.test", Date.now());
  const userId = Number(created.lastInsertRowid);
  const now = Date.now();
  db.prepare(`
    INSERT INTO payments
    (reference, user_id, package_id, credits, amount_pesewas, currency, status, created_at)
    VALUES ('CB-verified', ?, 'starter', 5, 1000, 'GHS', 'pending', ?)
  `).run(userId, now);
  db.prepare(`
    INSERT INTO payments
    (reference, user_id, package_id, credits, amount_pesewas, currency, status, created_at)
    VALUES ('CB-mismatch', ?, 'starter', 5, 1000, 'GHS', 'pending', ?)
  `).run(userId, now);

  context.mock.method(globalThis, "fetch", async (url) => {
    const reference = decodeURIComponent(url.split("/").pop());
    const amount = reference === "CB-verified" ? 1000 : 999;
    return new Response(JSON.stringify({
      status: true,
      data: {
        status: "success",
        reference,
        amount,
        currency: "GHS",
        id: 98765
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  });

  const verified = await verifyAndFulfill(db, "sk_test_example", "CB-verified", userId);
  assert.deepEqual(verified, { paid: true, credits: 5 });
  const repeated = await verifyAndFulfill(db, "sk_test_example", "CB-verified", userId);
  assert.deepEqual(repeated, { paid: true, credits: 5 });
  const mismatch = await verifyAndFulfill(db, "sk_test_example", "CB-mismatch", userId);
  assert.deepEqual(mismatch, { paid: false });
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM credit_ledger WHERE reason = 'purchase'").get().count,
    1
  );
  assert.equal(db.prepare("SELECT credits FROM users WHERE id = ?").get(userId).credits, 5);
});
