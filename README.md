## Overview

Janakpur Art and Craft is modelled after the real collective founded by Ajit Kumar Sah in 1993 to promote Mithila art and
uplift artisan communities in Nepal. This storefront showcases how their jewellery, vessels, textiles, and paintings can
reach global customers online, and it is built with:

- **Next.js App Router** (TypeScript, React Server Components)
- **Tailwind CSS v4** for styling
- **Prisma** + **MongoDB** as the data layer
- **Stripe Checkout** for secure payments
- **NextAuth.js** with an **Okta** OAuth provider

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
4. Generate an Okta API token (Security → API → Tokens) and add it to `OKTA_API_TOKEN`. This powers the custom sign-up flow.

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
- Sign up via `/auth/sign-up` (creates the user in Okta) and then sign in via `/auth/sign-in`.
- Complete the checkout form with shipping details and proceed to Stripe’s hosted payment page.
- Inspect `/admin/orders` to confirm statuses update after successful payment (requires webhook).
- Check your server console for email sending logs and your inbox for order confirmation emails.
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
- NextAuth is configured with database sessions and Prisma adapter.
- Stripe checkout route also stores a pending order to reconcile payment outcomes.
