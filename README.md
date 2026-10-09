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

## Free Render demo deployment

The repository includes a Render Blueprint in `render.yaml` for a free Node web service. It uses `/tmp/curiousbooster.sqlite` for SQLite, but Render's free web service has an ephemeral filesystem. **All account, session, credit, payment, and lesson-unlock records can be erased whenever the service spins down, restarts, or redeploys. Do not use real learner information or treat demo accounts as durable.** Render also spins down an idle free service after 15 minutes; waking it can take about a minute. Free services have usage limits and are not recommended for production.

1. Put this project in a GitHub repository. Do not upload `.env`, `data/`, or `node_modules/`.
2. In Render, choose **New → Blueprint**, select the repository, and review the configuration. It must use the `free` plan and must not create a persistent disk or paid resources.
3. Wait for the deploy to become healthy at the `*.onrender.com` address Render assigns. The app uses `RENDER_EXTERNAL_URL` for its public origin and secure sign-in cookies.
4. Keep the Paystack secret unset. Payments stay disabled; the GHS package prices are demonstrations, not prices to charge.
5. Use only test accounts and sample information. Do not invite real learners to this demo.

To preserve accounts between restarts, replace this demo setup with a persistent database and appropriate hosting before launch. The hosting account, verified source repository, and final public URL are controlled through Render and GitHub. This project does not contain hosting credentials, and deploying the Blueprint is not the same as publishing the service.

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
