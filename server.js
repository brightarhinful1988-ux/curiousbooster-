const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { promisify } = require("node:util");
const Database = require("better-sqlite3");
const dotenv = require("dotenv");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");

dotenv.config();

const scrypt = promisify(crypto.scrypt);
const SESSION_COOKIE = "cb_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PAYSTACK_API = "https://api.paystack.co";
const APP_DIRECTORY = __dirname;
const DEMO_PACKAGES = [
  { id: "starter", credits: 5, amountPesewas: 1000, label: "Starter" },
  { id: "standard", credits: 15, amountPesewas: 2500, label: "Study pack" },
  { id: "value", credits: 40, amountPesewas: 6000, label: "Value pack" }
];
const publicPackages = DEMO_PACKAGES.map((item) => ({
  id: item.id,
  credits: item.credits,
  priceGhs: (item.amountPesewas / 100).toFixed(2),
  label: item.label,
  provisional: true
}));

function loadCurriculum() {
  const source = fs.readFileSync(path.join(APP_DIRECTORY, "app.js"), "utf8");
  const endOfCurriculum = source.indexOf("\nconst STORAGE_KEY =");
  if (endOfCurriculum < 0) {
    throw new Error("Could not locate the end of the lesson curriculum.");
  }
  const module = { exports: null };
  const curriculumScript = `${source.slice(0, endOfCurriculum)}\nmodule.exports = branches;`;
  vm.runInNewContext(curriculumScript, { module }, { timeout: 1000 });
  if (!Array.isArray(module.exports)) {
    throw new Error("The lesson curriculum could not be loaded.");
  }
  return module.exports;
}

function getLessons(branch) {
  if (Array.isArray(branch.lessons)) {
    return branch.lessons;
  }
  return [{
    id: branch.id,
    year: null,
    title: branch.title,
    duration: branch.duration,
    intro: branch.intro,
    fact: branch.fact,
    question: branch.question,
    options: branch.options,
    answer: branch.answer,
    explanation: branch.explanation
  }];
}

function createDatabase(databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
      reference TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      package_id TEXT NOT NULL,
      credits INTEGER NOT NULL,
      amount_pesewas INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GHS',
      status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
      provider_transaction_id TEXT,
      created_at INTEGER NOT NULL,
      paid_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS unlocked_lessons (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL,
      unlocked_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS credit_ledger (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
  `);
  return db;
}

function apiError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function makeSession(db, userId, res, secureCookie) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(crypto.createHash("sha256").update(token).digest("hex"), userId, expiresAt);

  const cookie = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    secureCookie ? "Secure" : ""
  ].filter(Boolean).join("; ");
  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res, secureCookie) {
  const cookie = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    secureCookie ? "Secure" : ""
  ].filter(Boolean).join("; ");
  res.setHeader("Set-Cookie", cookie);
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator >= 0 && item.slice(0, separator).trim() === name) {
      return item.slice(separator + 1).trim();
    }
  }
  return null;
}

function validateProductionConfig(environment = process.env) {
  if (environment.NODE_ENV !== "production") {
    return;
  }

  const appBaseUrl = environment.APP_BASE_URL || environment.RENDER_EXTERNAL_URL;
  if (!appBaseUrl) {
    throw new Error("Set APP_BASE_URL to the public HTTPS URL before starting in production.");
  }

  let publicUrl;
  try {
    publicUrl = new URL(appBaseUrl);
  } catch (error) {
    throw new Error("APP_BASE_URL must be a valid public HTTPS URL.", { cause: error });
  }
  if (
    publicUrl.protocol !== "https:" ||
    publicUrl.username ||
    publicUrl.password ||
    publicUrl.search ||
    publicUrl.hash ||
    (publicUrl.pathname !== "/" && publicUrl.pathname !== "")
  ) {
    throw new Error("APP_BASE_URL must be the HTTPS origin for the deployed app.");
  }

  if (!environment.DATABASE_PATH || !path.isAbsolute(environment.DATABASE_PATH)) {
    throw new Error("Set DATABASE_PATH to an absolute path on persistent storage before production startup.");
  }

  if ((environment.PAYSTACK_SECRET_KEY || "").startsWith("sk_live_")) {
    throw new Error("Live Paystack payments are not implemented; remove the live secret key.");
  }
}

function createApp(options = {}) {
  const appBaseUrl = options.appBaseUrl || process.env.APP_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  const baseUrl = new URL(appBaseUrl);
  const secureCookie = baseUrl.protocol === "https:";
  const configuredSecret = options.paystackSecretKey ?? process.env.PAYSTACK_SECRET_KEY ?? "";
  const databasePath = options.databasePath || process.env.DATABASE_PATH ||
    path.join(APP_DIRECTORY, "data", "curiousbooster.sqlite");
  const db = options.db || createDatabase(databasePath);
  const curriculum = options.curriculum || loadCurriculum();
  const lessonCatalog = new Map();
  for (const branch of curriculum) {
    for (const lesson of getLessons(branch)) {
      lessonCatalog.set(lesson.id, { branch, lesson });
    }
  }
  const lessonIds = new Set(lessonCatalog.keys());
  const app = express();

  app.locals.db = db;
  app.locals.lessonIds = lessonIds;
  app.locals.lessonCatalog = lessonCatalog;
  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        styleSrcAttr: ["'unsafe-inline'"],
        upgradeInsecureRequests: null
      }
    }
  }));

  app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json", limit: "64kb" }),
    async (req, res) => {
      if (!configuredSecret.startsWith("sk_test_")) {
        return apiError(res, 503, "PAYMENTS_DISABLED", "Paystack test mode is not configured.");
      }
      const signature = req.get("x-paystack-signature");
      if (!signature || !Buffer.isBuffer(req.body)) {
        return apiError(res, 400, "INVALID_WEBHOOK", "The payment notification is invalid.");
      }
      const expected = crypto.createHmac("sha512", configuredSecret).update(req.body).digest();
      let supplied;
      try {
        supplied = Buffer.from(signature, "hex");
      } catch (error) {
        console.error("Invalid Paystack webhook signature encoding.", error);
        return apiError(res, 401, "INVALID_SIGNATURE", "The payment notification signature is invalid.");
      }
      if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
        return apiError(res, 401, "INVALID_SIGNATURE", "The payment notification signature is invalid.");
      }

      let event;
      try {
        event = JSON.parse(req.body.toString("utf8"));
      } catch (error) {
        console.error("Could not parse a signed Paystack webhook.", error);
        return apiError(res, 400, "INVALID_WEBHOOK", "The payment notification could not be read.");
      }
      if (event.event !== "charge.success" || typeof event.data?.reference !== "string") {
        return res.sendStatus(200);
      }
      try {
        await verifyAndFulfill(db, configuredSecret, event.data.reference);
        return res.sendStatus(200);
      } catch (error) {
        console.error("Could not verify a Paystack webhook transaction.", error);
        return apiError(res, 502, "PAYMENT_VERIFICATION_FAILED", "The payment could not be verified yet.");
      }
    }
  );

  app.use(express.json({ limit: "20kb" }));

  app.use("/api", (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      return next();
    }
    const origin = req.get("origin");
    if (!origin || origin !== baseUrl.origin) {
      return apiError(res, 403, "INVALID_ORIGIN", "This request did not come from CURIOUSBOOSTER.");
    }
    next();
  });

  app.use("/api", (req, res, next) => {
    const token = getCookie(req, SESSION_COOKIE);
    if (token && /^[A-Za-z0-9_-]{40,60}$/.test(token)) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const row = db.prepare(`
        SELECT users.id, users.email, users.credits
        FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      `).get(tokenHash, Date.now());
      if (row) {
        req.user = row;
        req.sessionTokenHash = tokenHash;
      }
    }
    next();
  });

  function requireUser(req, res, next) {
    if (!req.user) {
      return apiError(res, 401, "AUTH_REQUIRED", "Create an account or sign in to continue.");
    }
    next();
  }

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Too many attempts. Please wait and try again." } }
  });

  app.get("/api/packages", (req, res) => {
    res.json({ currency: "GHS", packages: publicPackages });
  });

  app.get("/api/health", (req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Health check could not query the database.", error);
      apiError(res, 503, "SERVICE_UNAVAILABLE", "The learning service is temporarily unavailable.");
    }
  });

  app.get("/api/catalog", (req, res) => {
    res.json({
      branches: curriculum.map((branch) => ({
        id: branch.id,
        name: branch.name,
        icon: branch.icon,
        summary: branch.summary,
        lessons: getLessons(branch).map((lesson) => ({
          id: lesson.id,
          year: lesson.year,
          title: lesson.title,
          duration: lesson.duration,
          hasCode: Boolean(lesson.code)
        }))
      }))
    });
  });

  app.post("/api/auth/register", authLimiter, async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return apiError(res, 400, "INVALID_EMAIL", "Enter a valid email address.");
    }
    if (password.length < 10 || password.length > 200) {
      return apiError(res, 400, "INVALID_PASSWORD", "Use a password with at least 10 characters.");
    }

    try {
      const salt = crypto.randomBytes(16);
      const hash = await scrypt(password, salt, 64);
      const result = db.prepare(`
        INSERT INTO users (email, password_salt, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `).run(email, salt.toString("hex"), Buffer.from(hash).toString("hex"), Date.now());
      makeSession(db, Number(result.lastInsertRowid), res, secureCookie);
      return res.status(201).json({
        user: { email },
        credits: 0,
        unlockedLessonIds: []
      });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return apiError(res, 409, "ACCOUNT_EXISTS", "An account with that email already exists. Please sign in.");
      }
      console.error("Could not create learner account.", error);
      return apiError(res, 500, "ACCOUNT_CREATE_FAILED", "The account could not be created. Please try again.");
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || password.length > 200) {
      return apiError(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    try {
      const hash = Buffer.from(await scrypt(password, Buffer.from(user.password_salt, "hex"), 64));
      const expected = Buffer.from(user.password_hash, "hex");
      if (hash.length !== expected.length || !crypto.timingSafeEqual(hash, expected)) {
        return apiError(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }
      makeSession(db, user.id, res, secureCookie);
      return res.json({
        user: { email: user.email },
        credits: user.credits,
        unlockedLessonIds: getUnlockedLessons(db, user.id)
      });
    } catch (error) {
      console.error("Could not sign in learner.", error);
      return apiError(res, 500, "SIGN_IN_FAILED", "Sign-in failed. Please try again.");
    }
  });

  app.post("/api/auth/logout", requireUser, (req, res) => {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(req.sessionTokenHash);
    clearSessionCookie(res, secureCookie);
    res.sendStatus(204);
  });

  app.get("/api/me", (req, res) => {
    if (!req.user) {
      return apiError(res, 401, "AUTH_REQUIRED", "Sign in to see your credits.");
    }
    res.json({
      user: { email: req.user.email },
      credits: req.user.credits,
      unlockedLessonIds: getUnlockedLessons(db, req.user.id)
    });
  });

  app.post("/api/payments/checkout", requireUser, async (req, res) => {
    if (!configuredSecret.startsWith("sk_test_")) {
      return apiError(
        res,
        503,
        "PAYMENTS_DISABLED",
        "Test checkout is not configured. Add your Paystack test secret key to .env."
      );
    }
    const selectedPackage = DEMO_PACKAGES.find((item) => item.id === req.body?.packageId);
    if (!selectedPackage) {
      return apiError(res, 400, "INVALID_PACKAGE", "Choose one of the listed credit packages.");
    }

    const reference = `CB-${crypto.randomBytes(18).toString("hex")}`;
    db.prepare(`
      INSERT INTO payments
      (reference, user_id, package_id, credits, amount_pesewas, currency, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'GHS', 'pending', ?)
    `).run(
      reference,
      req.user.id,
      selectedPackage.id,
      selectedPackage.credits,
      selectedPackage.amountPesewas,
      Date.now()
    );

    try {
      const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${configuredSecret}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: req.user.email,
          amount: selectedPackage.amountPesewas,
          currency: "GHS",
          reference,
          callback_url: new URL("/payment-return.html", appBaseUrl).toString(),
          metadata: {
            custom_fields: [
              { display_name: "Credit package", variable_name: "credit_package", value: selectedPackage.id }
            ]
          }
        })
      });
      const result = await response.json();
      if (!response.ok || !result.status || typeof result.data?.authorization_url !== "string") {
        console.error("Paystack did not initialize checkout.", result.message || response.status);
        return apiError(res, 502, "CHECKOUT_FAILED", "Secure checkout could not be started. Please try again.");
      }
      res.json({ authorizationUrl: result.data.authorization_url });
    } catch (error) {
      console.error("Could not connect to Paystack to start checkout.", error);
      apiError(res, 502, "CHECKOUT_UNAVAILABLE", "Secure checkout is unavailable. Please try again later.");
    }
  });

  app.post("/api/payments/verify", requireUser, async (req, res) => {
    const reference = typeof req.body?.reference === "string" ? req.body.reference : "";
    const payment = db.prepare("SELECT * FROM payments WHERE reference = ? AND user_id = ?")
      .get(reference, req.user.id);
    if (!payment) {
      return apiError(res, 404, "PAYMENT_NOT_FOUND", "This payment could not be found for your account.");
    }
    if (payment.status === "paid") {
      return res.json({ paid: true, credits: req.user.credits });
    }
    if (!configuredSecret.startsWith("sk_test_")) {
      return apiError(res, 503, "PAYMENTS_DISABLED", "Paystack test mode is not configured.");
    }
    try {
      const result = await verifyAndFulfill(db, configuredSecret, reference, req.user.id);
      if (!result.paid) {
        return apiError(res, 409, "PAYMENT_NOT_COMPLETE", "Payment is not confirmed yet. Please wait and try again.");
      }
      res.json({ paid: true, credits: result.credits });
    } catch (error) {
      console.error("Could not verify Paystack payment.", error);
      apiError(res, 502, "PAYMENT_VERIFICATION_FAILED", "Payment verification failed. Please try again.");
    }
  });

  app.get("/api/lessons/:lessonId/access", requireUser, (req, res) => {
    if (!lessonIds.has(req.params.lessonId)) {
      return apiError(res, 404, "LESSON_NOT_FOUND", "This lesson could not be found.");
    }
    const unlocked = db.prepare(
      "SELECT 1 FROM unlocked_lessons WHERE user_id = ? AND lesson_id = ?"
    ).get(req.user.id, req.params.lessonId);
    res.json({ unlocked: Boolean(unlocked), credits: req.user.credits });
  });

  app.get("/api/lessons/:lessonId/content", requireUser, (req, res) => {
    const entry = lessonCatalog.get(req.params.lessonId);
    if (!entry) {
      return apiError(res, 404, "LESSON_NOT_FOUND", "This lesson could not be found.");
    }
    const unlocked = db.prepare(
      "SELECT 1 FROM unlocked_lessons WHERE user_id = ? AND lesson_id = ?"
    ).get(req.user.id, req.params.lessonId);
    if (!unlocked) {
      return apiError(res, 403, "LESSON_LOCKED", "Use 1 credit to unlock this lesson before reading it.");
    }
    res.json({ branchName: entry.branch.name, lesson: entry.lesson });
  });

  app.post("/api/lessons/:lessonId/unlock", requireUser, (req, res) => {
    const lessonId = req.params.lessonId;
    if (!lessonIds.has(lessonId)) {
      return apiError(res, 404, "LESSON_NOT_FOUND", "This lesson could not be found.");
    }
    try {
      const result = db.transaction(() => {
        const existing = db.prepare(
          "SELECT 1 FROM unlocked_lessons WHERE user_id = ? AND lesson_id = ?"
        ).get(req.user.id, lessonId);
        const current = db.prepare("SELECT credits FROM users WHERE id = ?").get(req.user.id);
        if (existing) {
          return { unlocked: true, alreadyUnlocked: true, credits: current.credits };
        }
        if (current.credits < 1) {
          return { insufficientCredits: true, credits: current.credits };
        }
        const now = Date.now();
        db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(req.user.id);
        db.prepare(
          "INSERT INTO unlocked_lessons (user_id, lesson_id, unlocked_at) VALUES (?, ?, ?)"
        ).run(req.user.id, lessonId, now);
        db.prepare(`
          INSERT INTO credit_ledger (user_id, delta, reason, reference, created_at)
          VALUES (?, -1, 'lesson_unlock', ?, ?)
        `).run(req.user.id, `unlock:${lessonId}:${req.user.id}`, now);
        const updated = db.prepare("SELECT credits FROM users WHERE id = ?").get(req.user.id);
        return { unlocked: true, alreadyUnlocked: false, credits: updated.credits };
      }).immediate();
      if (result.insufficientCredits) {
        return apiError(
          res,
          402,
          "INSUFFICIENT_CREDITS",
          "You need at least 1 credit to unlock a new lesson. Choose a package to add credits."
        );
      }
      res.json(result);
    } catch (error) {
      console.error("Could not unlock lesson.", error);
      apiError(res, 500, "LESSON_UNLOCK_FAILED", "The lesson could not be unlocked. Please try again.");
    }
  });

  app.get("/", (req, res) => res.sendFile(path.join(APP_DIRECTORY, "index.html")));
  for (const file of [
    "index.html",
    "lesson.html",
    "quiz.html",
    "payment-return.html",
    "styles.css",
    "pwa.js",
    "app-client.js",
    "credits.js",
    "lesson-page.js",
    "quiz-page.js",
    "payment-return.js"
  ]) {
    app.get(`/${file}`, (req, res) => res.sendFile(path.join(APP_DIRECTORY, file)));
  }
  app.get("/manifest.webmanifest", (req, res) => {
    res.sendFile(path.join(APP_DIRECTORY, "manifest.webmanifest"));
  });
  app.get("/service-worker.js", (req, res) => {
    res.set("Cache-Control", "no-cache");
    res.set("Service-Worker-Allowed", "/");
    res.sendFile(path.join(APP_DIRECTORY, "service-worker.js"));
  });
  app.use("/assets", express.static(path.join(APP_DIRECTORY, "assets"), {
    dotfiles: "deny",
    fallthrough: false,
    index: false
  }));
  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return apiError(res, 404, "NOT_FOUND", "This API route could not be found.");
    }
    res.status(404).type("text").send("Page not found.");
  });
  app.use((error, req, res, next) => {
    console.error("Request failed.", error);
    if (res.headersSent) {
      return next(error);
    }
    apiError(res, error.status || 500, "REQUEST_FAILED", "The request could not be completed.");
  });
  return app;
}

function getUnlockedLessons(db, userId) {
  return db.prepare("SELECT lesson_id FROM unlocked_lessons WHERE user_id = ? ORDER BY unlocked_at")
    .all(userId).map((row) => row.lesson_id);
}

async function verifyAndFulfill(db, secret, reference, expectedUserId = null) {
  const payment = db.prepare("SELECT * FROM payments WHERE reference = ?").get(reference);
  if (!payment || (expectedUserId !== null && payment.user_id !== expectedUserId)) {
    return { paid: false };
  }
  if (payment.status === "paid") {
    const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(payment.user_id);
    return { paid: true, credits: user.credits };
  }
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  const verification = await response.json();
  const transaction = verification.data;
  if (
    !response.ok ||
    !verification.status ||
    transaction?.status !== "success" ||
    transaction?.reference !== payment.reference ||
    transaction?.amount !== payment.amount_pesewas ||
    transaction?.currency !== payment.currency
  ) {
    return { paid: false };
  }

  return db.transaction(() => {
    const latest = db.prepare("SELECT * FROM payments WHERE reference = ?").get(reference);
    if (latest.status !== "paid") {
      db.prepare(`
        UPDATE payments
        SET status = 'paid', provider_transaction_id = ?, paid_at = ?
        WHERE reference = ? AND status = 'pending'
      `).run(String(transaction.id), Date.now(), reference);
      const updated = db.prepare("SELECT status FROM payments WHERE reference = ?").get(reference);
      if (updated.status !== "paid") {
        return { paid: false };
      }
      db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?")
        .run(latest.credits, latest.user_id);
      db.prepare(`
        INSERT INTO credit_ledger (user_id, delta, reason, reference, created_at)
        VALUES (?, ?, 'purchase', ?, ?)
      `).run(latest.user_id, latest.credits, `payment:${reference}`, Date.now());
    }
    const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(latest.user_id);
    return { paid: true, credits: user.credits };
  }).immediate();
}

if (require.main === module) {
  validateProductionConfig();
  const app = createApp();
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  app.listen(port, () => {
    console.log(`CURIOUSBOOSTER is running at ${
      process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`
    }`);
    if (!(process.env.PAYSTACK_SECRET_KEY || "").startsWith("sk_test_")) {
      console.log("Payments are disabled until a Paystack test secret key is added to .env.");
    }
  });
}

module.exports = {
  createApp,
  DEMO_PACKAGES,
  loadCurriculum,
  validateProductionConfig,
  verifyAndFulfill
};
