## Overview

Janakpur Art and Craft is modelled after the real collective founded by Ajit Kumar Sah in 1993 to promote Mithila art and
uplift artisan communities in Nepal. This storefront showcases how their jewellery, vessels, textiles, and paintings can
reach global customers online, and it is built with:

- **Next.js App Router** (TypeScript, React Server Components)
- **Tailwind CSS v4** for styling
- **Prisma** + **MongoDB** as the data layer
- **Stripe Checkout** for secure payments
- **NextAuth.js** with local email/password accounts and optional **Okta** OIDC

The project includes core storefront screens (home, products, product detail, cart, checkout), a role-aware administrative
dashboard, bulk import tooling, Stripe webhooks, and ready-to-deploy configuration for Vercel.

### Highlights

- Role-based admin dashboard for catalogue, orders, and import jobs
- Bulk JSON import pipeline that upserts categories, artisans, and products with audit logs
- Order management workflow with fulfilment stages, tracking numbers, and Stripe webhook reconciliation
- Customer checkout form that captures shipping details, computes region-aware shipping, and creates Stripe sessions

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to explore the storefront.

### Environment Variables

Create an `.env` file (see `.env.example` for reference):

```
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="generate-a-strong-secret"
NEXTAUTH_URL="http://localhost:3000"

OKTA_CLIENT_ID="your-okta-client-id"
OKTA_CLIENT_SECRET="your-okta-client-secret"
OKTA_ISSUER="https://your-okta-domain.okta.com/oauth2/default"
OKTA_API_TOKEN="your-okta-api-token"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

ADMIN_EMAILS="founder@jac.com.np,operations@jac.com.np"
BLOB_READ_WRITE_TOKEN="vercel-blob-read-write-token"
```

> Tip: use `openssl rand -base64 32` to generate `NEXTAUTH_SECRET`.

### Database

1. Update `DATABASE_URL` with your MongoDB connection string.
2. Generate the Prisma client: `npx prisma generate`
3. Optional: push schema to your database `npx prisma db push`

The application seeds a small catalog the first time it runs if the database is empty.

### Authentication (Okta)

1. Create an Okta OIDC application.
2. Configure the callback URL: `http://localhost:3000/api/auth/callback/okta`
3. Copy the Client ID, Client Secret, and Issuer URL into your `.env`.
4. Set the Okta values only if you want to offer Okta sign-in alongside the built-in email and password accounts.

### Stripe

1. Create a product catalog or use test mode.
2. Add your secret and publishable keys to `.env`.
3. **For Local Development**: Install Stripe CLI and forward webhooks:

   ```bash
   # Install Stripe CLI (if not already installed)
   # macOS: brew install stripe/stripe-cli/stripe
   # Or download from https://stripe.com/docs/stripe-cli

   # Login to Stripe CLI
   stripe login

   # Forward webhooks to your local server (run in a separate terminal)
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   This will output a webhook signing secret (starts with `whsec_`). Copy this to `STRIPE_WEBHOOK_SECRET` in your `.env` file.

4. **For Production**: Create a webhook endpoint (e.g. `https://yourdomain.com/api/stripe/webhook`) in the Stripe dashboard and copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
5. (Optional) Configure Stripe Tax or shipping rates if you need automated localisation.

### Admin dashboard & RBAC

- Signed-in users whose email matches `ADMIN_EMAILS` are automatically promoted to the `ADMIN` role; staff can be managed via the Prisma `User` model.
- Protected routes:
  - `/admin` – overview analytics
  - `/admin/products` – create products, toggle featured/published states, and manage artisans/categories
  - `/admin/orders` – update statuses, fulfilment stages, tracking, and view customer details
  - `/admin/imports` – run JSON-based bulk imports and monitor job history
- Middleware enforces role access for both pages and `/api/admin/*` endpoints.

### Stripe webhook lifecycle

- `checkout.session.completed` → marks the order as `PAID`, stores the payment intent, and transitions fulfilment to `PREPARING`.
- `checkout.session.expired` / `checkout.session.async_payment_failed` → updates the order to `CANCELLED` or `FAILED`.
- Extend `src/app/api/stripe/webhook/route.ts` with additional events (refunds, disputes) as needed.

### Testing the Flow

- Visit `/products` to browse Mithila handicrafts, add items to the cart, and verify stock handling.
- Sign up via `/auth/sign-up` (creates a local customer account), verify the email if transactional email is enabled, and then sign in via `/auth/sign-in`.
- Complete the checkout form with shipping details and proceed to Stripe’s hosted payment page.
- Inspect `/admin/orders` to confirm statuses update after successful payment (requires webhook).
- Check your server console for email sending logs and your inbox for order confirmation emails.

### Production reliability

- Vercel load-balances serverless requests automatically. Point an uptime monitor at `/api/health`; it verifies MongoDB connectivity and returns `503` when the service is degraded.
- Public product API responses use CDN caching for five minutes with stale-while-revalidate. Product images use Next Image AVIF/WebP variants and a one-day cache.
- Sensitive account and checkout endpoints have shared database-backed rate limits. Configure Vercel Firewall/WAF and DDoS protection in the Vercel project for edge-level protection.
- The app provides route and global error boundaries, security response headers, and opt-in internal page/error telemetry. Set both analytics variables to `true` only when you want to retain these anonymous operational events.
- Product image uploads accept JPEG, PNG, WebP, and AVIF only, with a 5 MB limit. The email configuration diagnostic is restricted to admin and staff sessions.
- Payment routes reserve up to 30 seconds through Next.js route configuration. Add every production environment variable in Vercel before deployment; `/api/health` reports a degraded status when core configuration is missing.
- Use `/admin/products` to upload imagery (stored in Vercel Blob) and publish new catalogue items.

## Deployment (Vercel)

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Create a new Vercel project and import the repo.
3. Set all environment variables in the Vercel dashboard.
4. Trigger the deploy—Vercel will build and host the app automatically.

Post-deploy tasks:

- Update `NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL` to your production domain.
- Configure Stripe webhook for the production URL if you intend to process live payments.

## Useful Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start local development server            |
| `npm run build`     | Create a production build                 |
| `npm run start`     | Run the production build                  |
| `npm run lint`      | Check code style and lint errors          |
| `npx prisma studio` | Inspect and modify data via Prisma Studio |

## Folder Structure Highlights

- `src/app` – App Router pages and API routes
- `src/components` – Reusable UI components
- `src/providers` – React context providers (auth, cart)
- `src/lib` – Prisma client, business logic helpers
- `prisma/schema.prisma` – Prisma schema and models

## Notes

- Tailwind CSS v4 uses the new `@import "tailwindcss"` syntax.
- Authentication uses signed JWT sessions with the Prisma adapter. Customers can register with a local email and password; passwords are stored only as salted scrypt hashes. Okta OIDC is an optional sign-in method when its three `OKTA_*` settings are configured.
- Stripe checkout route also stores a pending order to reconcile payment outcomes.

## eSewa and Khalti payments

Checkout supports Stripe (USD), eSewa ePay v2, and Khalti Web Checkout (NPR).
The catalog and order accounting remain in USD; each wallet order stores its exact
NPR amount in paisa, the merchant conversion rate, provider reference, and verified
transaction ID. Checkout displays the NPR total before redirecting. Shipping and
estimated tax are computed on the server; clients cannot override them.

Configure these server environment variables (never prefix secret keys with `NEXT_PUBLIC_`):

- `PAYMENT_ENVIRONMENT`: `sandbox` or `production`, explicitly required.
- `PAYMENT_USD_TO_NPR_RATE`: your approved merchant NPR-per-USD conversion rate.
  The environment template uses 135 for sandbox demonstration only. There is no automatic exchange-rate feed; set an approved rate before production.
- `ESEWA_PRODUCT_CODE` and `ESEWA_SECRET_KEY`: merchant credentials from eSewa.
- `KHALTI_SECRET_KEY`: the secret key from the appropriate Khalti merchant dashboard.
- `NEXT_PUBLIC_APP_URL`: your canonical site origin, HTTPS for live payments.

Wallet methods remain unavailable until their configuration is complete. Stripe
requires only its server secret for the hosted checkout redirect. Existing product
prices are **not** reinterpreted as NPR. The existing 8% estimated tax policy is
preserved; review your tax and shipping policy before taking live orders.

Run `npx prisma generate` after pulling these changes. New Order fields are optional
and require no existing-data backfill. MongoDB must be a replica set (including Atlas)
for the atomic payment and inventory transaction. No database push was performed as
part of this change.

Provider setup and callback behavior:

1. Follow the official [eSewa ePay v2 documentation](https://developer.esewa.com.np/pages/Epay)
   and [Khalti Web Checkout documentation](https://docs.khalti.com/khalti-epayment/)
   to obtain sandbox credentials. For Khalti, use the secret key from its test merchant
   dashboard, not a public key. For eSewa, use its documented UAT product code and key.
2. Both providers return to `/api/payments/verify/<orderId>` on the canonical origin.
   The server verifies eSewa callback signatures and queries the provider directly.
   Khalti uses its persisted `pidx` for lookup. Amount and reference mismatches never
   mark the order paid.
3. The confirmation page requires the order owner's session. Pending wallet orders
   can be checked again there, including when the initial callback was interrupted.
   Only verified paid/fulfilled orders clear the cart. Repeated callbacks cannot
   deduct wallet order inventory twice.
4. Test success, cancellation, insufficient balance, provider timeout, callback replay,
   tampered amounts, and expired sign-in sessions with sandbox accounts. Check both
   provider dashboards and admin orders, and confirm stock changes only once.
5. Switch to `production`, install approved live merchant keys and product code,
   and confirm the HTTPS site origin before accepting real money.

Operational limits: wallet orders awaiting a callback stay pending until checked
again; no scheduled reconciliation or automatic wallet refunds are included. Reconcile
abandoned/pending orders against merchant dashboards. Wallet confirmation emails are
not sent automatically. If stock sells out during payment, the verified payment is
recorded with an inventory-review note and fulfillment stays blocked for staff review.
Payment initiation timeouts can leave pending orders; check them before retrying a charge.

Run `npm run test:payments` for payment-validation, signature, amount, and replay tests.

### Ready-to-use sandbox settings

The local environment and `.env.example` include the public eSewa test product code
and signing key from https://developer.esewa.com.np/pages/Test-credentials. Never use
these for production. Live mode refuses the public eSewa credentials.

- eSewa test login: `9711111111`, password `Test@123`, OTP `123456`.
- Khalti test payer: `9800000000`, MPIN `1111`, OTP `987654`.
- Khalti merchant credential: add your own test dashboard's `live_secret_key` as
  `KHALTI_SECRET_KEY` in `.env`. Payer credentials cannot authenticate the merchant API.
- Local return origin: `http://localhost:3000`. Run the app on port 3000, or update
  both `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to the actual local origin and restart.
- eSewa sandbox verification uses `https://rc.esewa.com.np`; the older `uat` host
  is no longer used. Production verification uses `https://esewa.com.np`.

Run `npm run check:payments` to check configuration and contact the actual sandbox
providers. This creates a small, unpaid sandbox payment session, never a charge or
store order. It refuses production mode and does not log secrets. A successful
provider probe does not replace completing a signed-in store checkout and verifying
its order and inventory. Restart the development server after changing `.env`.

## Authentication

Local account registration works with only `DATABASE_URL`, `NEXTAUTH_SECRET`, and
`NEXTAUTH_URL`. Set a long random `NEXTAUTH_SECRET` for every deployed environment.

Okta is optional. To enable it, create an **OIDC Web Application** in Okta and add
`https://your-domain/api/auth/callback/okta` as a Sign-in redirect URI. Then set
`OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`, and `OKTA_ISSUER` (usually ending in
`/oauth2/default`). The sign-in page displays the Okta option only when all three
values are present. Local registration remains independent of Okta.
