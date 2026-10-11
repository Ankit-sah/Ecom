import { defineConfig, devices } from "@playwright/test";

const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("/ecom_e2e")) {
  throw new Error("Set E2E_DATABASE_URL to an isolated MongoDB replica-set database named ecom_e2e.");
}
process.env.DATABASE_URL = databaseUrl;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/auth/sign-in",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      E2E_SERVER: "true",
      DATABASE_URL: databaseUrl,
      NEXTAUTH_URL: "http://localhost:3100",
      NEXT_PUBLIC_APP_URL: "http://localhost:3100",
      NEXTAUTH_SECRET: "isolated-e2e-secret-only",
      ADMIN_EMAILS: "",
      OKTA_CLIENT_ID: "", OKTA_CLIENT_SECRET: "", OKTA_ISSUER: "",
      EMAIL_ENABLED: "false",
      PAYMENT_ENVIRONMENT: "sandbox",
      PAYMENT_USD_TO_NPR_RATE: "135",
      ESEWA_PRODUCT_CODE: "EPAYTEST",
      ESEWA_SECRET_KEY: "8gBm/:&EnhH.1/q",
      ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
    },
  },
});
