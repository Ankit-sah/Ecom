import { createHmac, timingSafeEqual } from "node:crypto";

export type WalletProvider = "esewa" | "khalti";
export function walletConfig() {
  const rate = Number(process.env.PAYMENT_USD_TO_NPR_RATE);
  const environment = process.env.PAYMENT_ENVIRONMENT;
  const configured = (environment === "sandbox" || environment === "production") && Number.isFinite(rate) && rate > 0;
  return {
    rate: configured ? rate : null,
    sandbox: environment !== "production",
    esewa: Boolean(configured && process.env.ESEWA_PRODUCT_CODE && process.env.ESEWA_SECRET_KEY && (environment === "sandbox" || (process.env.ESEWA_PRODUCT_CODE !== "EPAYTEST" && process.env.ESEWA_SECRET_KEY !== "8gBm/:&EnhH.1/q"))),
    khalti: Boolean(configured && process.env.KHALTI_SECRET_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  };
}
export function paymentOrigin() {
  const url = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  if (process.env.PAYMENT_ENVIRONMENT === "production" && url.protocol !== "https:") throw new Error("HTTPS payment origin required.");
  return url.origin;
}
export function toPaisa(cents: number, rate: number) {
  const amount = Math.round(cents * rate);
  if (!Number.isSafeInteger(amount) || amount < 1000 || amount > 2147483647) throw new Error("Wallet total must be at least NPR 10 and within the supported limit.");
  return amount;
}
export function esewaSignature(message: string, secret = process.env.ESEWA_SECRET_KEY) {
  if (!secret) throw new Error("eSewa is unavailable.");
  return createHmac("sha256", secret).update(message).digest("base64");
}
export function verifyEsewaResponse(data: Record<string, unknown>) {
  const fields = "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names";
  if (data.signed_field_names !== fields || typeof data.signature !== "string") return false;
  if (fields.split(",").some(field => !["string", "number"].includes(typeof data[field]))) return false;
  const expected = Buffer.from(esewaSignature(fields.split(",").map(field => `${field}=${data[field]}`).join(",")), "base64");
  const received = Buffer.from(data.signature, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
export async function khaltiRequest(path: "initiate" | "lookup", body: object) {
  const host = walletConfig().sandbox ? "https://dev.khalti.com" : "https://khalti.com";
  const response = await fetch(`${host}/api/v2/epayment/${path}/`, {
    method: "POST", headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Khalti is temporarily unavailable. Please try again.");
  return response.json();
}
