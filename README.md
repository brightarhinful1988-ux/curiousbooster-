# CURIOUSBOOSTER

CURIOUSBOOSTER is a high-school science learning app. Its Express server stores learner accounts, credit balances, lesson unlocks, and payment records in SQLite.

## Run locally

Requirements: Node.js 20 or later.

In PowerShell, from this folder:

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd start
```

Then open <http://localhost:3000>. Do not open `index.html` directly as a `file:` URL; account sessions and lesson access require the server.

Learners register with an email address and a password of at least 10 characters. A credit unlocks one new lesson permanently. Opening an unlocked lesson again and taking its quiz do not consume more credits.

## Install and offline use

CURIOUSBOOSTER can be installed as a progressive web app (PWA) from a supported browser; this is a website install, not a packaged Play Store or App Store app. On localhost, open the browser's install option (or use the in-page install button when the browser offers it). A public installation requires HTTPS.

After the first online visit, the service worker can load the app's static page shell and bundled icon photos offline. Sign-in, credit balances, the lesson catalogue, protected lesson content, unlocks, and checkout still require the server and an internet connection. Account data and API responses are deliberately not cached on the device.

The `/api/health` endpoint provides a minimal database-backed health check for a hosting platform.

## Free public lessons demo on GitHub Pages

Build the static demo with `npm run build:demo`. It creates the `docs/` folder containing the public lesson catalogue and pages for GitHub Pages. In the GitHub repository, open **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and `/docs` folder, then save. GitHub will show the public website address when the Pages deployment is ready.

The public demo includes all lessons and quizzes, but has no accounts, payments, credits, or server-backed progress. Quiz completion is stored only in the visitor's browser. Do not use it for private or real learner information. The regular Express application remains available for local use and future deployment with a persistent database.

## Paystack test checkout

Checkout is deliberately disabled until a Paystack **test** secret key is configured. Add a key beginning with `sk_test_` to `.env`:

```dotenv
PAYSTACK_SECRET_KEY=sk_test_your_key_from_the_paystack_test_dashboard
```

Restart the server. Checkout redirects to Paystack's hosted test checkout. Credits are only granted after the server verifies the transaction directly with Paystack and confirms the reference, amount, currency, and success status. Live keys beginning with `sk_live_` are rejected.

The included packages (5 credits for GH₵10.00, 15 for GH₵25.00, and 40 for GH₵60.00) are **provisional demonstration prices**. Change `DEMO_PACKAGES` in `server.js` before offering prices to learners. Package amounts are stored as Ghana pesewas.

The webhook endpoint is `/api/payments/webhook`; configure it with Paystack only when deploying to a public HTTPS server. Its signature is verified, and each transaction is independently verified before credits are added.

## Important before launch

- The current integration is test-mode only. It does not accept real money.
- Paystack onboarding, settlement, supported payment methods, and international customer coverage must be confirmed for the Ghana-registered business before choosing a live launch.
- Deploy behind HTTPS, set `APP_BASE_URL` to the final origin, use a persistent protected database volume, back up the database, and configure the Paystack webhook.
- The lesson catalogue is served without lesson text; the server returns lesson content only to a signed-in account that has unlocked it.
- This project is not yet ready to accept real payments or launch publicly to students. Before launch, implement and test email verification and account recovery; publish reviewed privacy, terms, and refund policies; configure operational monitoring and database backups; and complete safeguarding/privacy review suitable for the learners' ages and location.
- Do not place real learner or payment data in a demo deployment. Confirm hosting, domain ownership, data residency/retention, and a support contact before inviting learners.

## App icon photo credits

The icon combines these CC0 photographs from Wikimedia Commons:

- Laptop and book stacks by freddie marriage: <https://commons.wikimedia.org/wiki/File:Laptop_on_desk_book_stacks_(Unsplash).jpg>
- Fire by Marko Horvat: <https://commons.wikimedia.org/wiki/File:Fire_1_(Unsplash).jpg>
- Water splash by Erwan Hesry: <https://commons.wikimedia.org/wiki/File:Splashing_water_and_rocks_(Unsplash).jpg>

## Tests

```powershell
npm.cmd test
```

The tests cover account and lesson access controls, payment verification, and basic PWA/health-check routes. They do not certify production hosting, legal compliance, or live payment readiness.
