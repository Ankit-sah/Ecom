"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/providers/cart-provider";
import { formatCurrencyFromCents } from "@/utils/format";

type PaymentOptions = { stripe: boolean; esewa: boolean; khalti: boolean; rate: number | null; sandbox: boolean };
type Provider = "stripe" | "esewa" | "khalti";
const methods = [
  { id: "stripe" as const, name: "Credit or debit card", detail: "Pay in USD · Powered by Stripe", mark: "CARD", color: "text-[#31554d]" },
  { id: "esewa" as const, name: "eSewa", detail: "Pay securely with your eSewa wallet", mark: "e", color: "text-[#387b24]" },
  { id: "khalti" as const, name: "Khalti", detail: "Pay securely with Khalti", mark: "K", color: "text-[#69349a]" },
];
const fields = [
  { key: "fullName", label: "Full name", autoComplete: "name", required: true },
  { key: "phone", label: "Phone number", autoComplete: "tel", type: "tel" },
  { key: "addressLine1", label: "Street address", autoComplete: "address-line1", required: true, wide: true },
  { key: "addressLine2", label: "Apartment, suite, etc. (optional)", autoComplete: "address-line2", wide: true },
  { key: "city", label: "City", autoComplete: "address-level2", required: true },
  { key: "state", label: "Province / state", autoComplete: "address-level1" },
  { key: "postalCode", label: "Postal code", autoComplete: "postal-code", required: true },
  { key: "country", label: "Country code (e.g. NP, US)", autoComplete: "country", required: true },
] as const;

export function CheckoutPageClient({ options }: { options: PaymentOptions }) {
  const { items, subtotalCents, totalQuantity } = useCart();
  const [provider, setProvider] = useState<Provider>(options.esewa ? "esewa" : options.khalti ? "khalti" : "stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<Record<string, string>>({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "NP" });
  const shippingMethod = shipping.country.trim().toUpperCase() === "NP" ? "domestic" : "international";
  const taxCents = Math.round(subtotalCents * 0.08);
  const shippingCents = items.length ? shippingMethod === "domestic" ? Math.max(800, Math.round(subtotalCents * 0.05)) : Math.max(2500, Math.round(subtotalCents * 0.12)) : 0;
  const totalCents = subtotalCents + taxCents + shippingCents;
  const paisa = options.rate ? Math.round(totalCents * options.rate) : 0;
  const payable = provider === "stripe" ? formatCurrencyFromCents(totalCents) : formatCurrencyFromCents(paisa, "en-NP", "NPR");

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || !options[provider]) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(provider === "stripe" ? "/api/stripe/checkout" : "/api/payments/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })), shippingMethod, shippingAddress: shipping, exchangeRate: options.rate, expectedAmountPaisa: paisa }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Please sign in again before paying." : result.error || "Unable to start payment. Please try again.");
      if (provider === "esewa" && result.action && result.fields) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.action;
        for (const [name, value] of Object.entries(result.fields)) {
          const input = document.createElement("input");
          input.type = "hidden"; input.name = name; input.value = String(value); form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        return;
      }
      if (!result.url) throw new Error("The payment link could not be created. Please try again.");
      window.location.assign(result.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to start payment.");
      setIsLoading(false);
    }
  }

  if (!items.length) return <div className="mx-auto max-w-xl rounded-2xl border border-[#ddcfbb] bg-white p-10 text-center sm:p-16">
    <span className="text-4xl text-[#b9472f]" aria-hidden="true">◇</span>
    <h1 className="mt-5 font-serif text-3xl text-[#242b25]">Your next keepsake awaits</h1>
    <p className="mt-3 text-sm leading-6 text-neutral-600">Explore handmade pieces from Janakpur and add a little artistry to your everyday.</p>
    <Link href="/products" className="mt-7 inline-flex rounded-full bg-[#b9472f] px-6 py-3 text-sm font-semibold text-white">Explore the collection →</Link>
  </div>;

  return <form onSubmit={handleCheckout} className="mx-auto max-w-6xl">
    <div className="mb-8 flex items-center gap-3 text-xs text-neutral-500"><Link href="/cart" className="hover:text-[#b9472f]">Shopping bag</Link><span aria-hidden="true">/</span><span className="font-semibold text-[#31554d]">Checkout</span><span aria-hidden="true">/</span><span>Confirmation</span></div>
    <header className="mb-10"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b9472f]">Made with care. Chosen by you.</p><h1 className="mt-3 font-serif text-4xl text-[#242b25] sm:text-5xl">One step closer to handmade.</h1><p className="mt-4 text-neutral-600">Tell us where to send your pieces, then choose how you’d like to pay.</p></header>
    <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#ddcfbb] bg-white p-5 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-[#242b25]"><span className="mr-3 text-[#b9472f]">01</span> Delivery details</h2>
          <fieldset disabled={isLoading} className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="sr-only">Shipping address</legend>
            {fields.map(field => <label key={field.key} className={`space-y-2 text-sm font-medium text-neutral-700 ${"wide" in field ? "sm:col-span-2" : ""}`}>
              <span>{field.label}{"required" in field && <span aria-hidden="true" className="text-[#b9472f]"> *</span>}</span>
              <input name={field.key} autoComplete={field.autoComplete} type={"type" in field ? field.type : "text"} required={"required" in field} maxLength={field.key === "country" ? 2 : 200} pattern={field.key === "country" ? "[A-Za-z]{2}" : undefined} value={shipping[field.key]} onChange={event => setShipping(prev => ({ ...prev, [field.key]: event.target.value }))} className="block min-h-12 w-full min-w-0 rounded-lg border border-[#ddcfbb] bg-[#fffdf9] px-3 py-2 font-normal transition focus:border-[#31554d] focus:ring-2 focus:ring-[#31554d]/15" />
            </label>)}
          </fieldset>
          <div className="mt-6 rounded-xl bg-[#f3f5ef] p-4 text-sm"><p className="font-semibold text-[#31554d]">{shippingMethod === "domestic" ? "Domestic courier · Nepal" : "International express"}</p><p className="mt-1 text-neutral-600">{shippingMethod === "domestic" ? "Estimated delivery in 3–5 business days." : "Estimated delivery in 5–10 business days."} Shipping is calculated from your destination.</p></div>
        </section>
        <section className="rounded-2xl border border-[#ddcfbb] bg-white p-5 sm:p-8">
          <h2 className="mb-5 text-xl font-semibold text-[#242b25]"><span className="mr-3 text-[#b9472f]">02</span> Payment method</h2>
          <fieldset disabled={isLoading} className="space-y-3"><legend className="sr-only">Choose payment method</legend>
            {methods.map(method => <label key={method.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${!options[method.id] ? "cursor-not-allowed opacity-50" : provider === method.id ? "border-[#31554d] bg-[#f3f5ef] ring-1 ring-[#31554d]" : "border-[#ddcfbb] hover:bg-[#faf7f1]"}`}>
              <span aria-hidden="true" className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-lg border border-[#ddcfbb] bg-white font-bold ${method.color} ${method.id === "stripe" ? "text-[10px]" : "text-2xl"}`}>{method.mark}</span>
              <span className="flex-1"><span className="block text-sm font-semibold">{method.name}</span><span className="mt-1 block text-xs leading-5 text-neutral-600">{options[method.id] ? method.detail : "Currently unavailable"}</span></span>
              <input type="radio" name="paymentMethod" value={method.id} checked={provider === method.id} disabled={!options[method.id]} onChange={() => setProvider(method.id)} className="h-4 w-4 accent-[#31554d]" />
            </label>)}
          </fieldset>
          <p className="mt-4 text-xs leading-5 text-neutral-500">You’ll complete payment on your selected provider’s secure page. Your payment credentials are never stored here.</p>
        </section>
      </div>
      <aside className="rounded-2xl border border-[#ddcfbb] bg-[#fffdf9] p-5 sm:p-8 lg:sticky lg:top-24">
        <div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-[#242b25]">Your selection</h2><Link href="/cart" className="text-sm text-[#b9472f] underline underline-offset-4">Edit bag</Link></div>
        <p className="mt-1 text-xs text-neutral-500">{totalQuantity} {totalQuantity === 1 ? "piece" : "pieces"}, crafted with care</p>
        <ul className="my-6 divide-y divide-[#ddcfbb]">{items.map(item => <li key={item.product.id} className="flex justify-between gap-4 py-4 text-sm"><div><Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">{item.product.name}</Link><p className="mt-1 text-xs text-neutral-500">Quantity {item.quantity}</p></div><span className="shrink-0">{formatCurrencyFromCents(item.product.priceCents * item.quantity)}</span></li>)}</ul>
        <dl className="space-y-3 text-sm text-neutral-600">{[["Subtotal", subtotalCents], ["Estimated tax (8%)", taxCents], ["Shipping", shippingCents]].map(([label, amount]) => <div key={label} className="flex justify-between"><dt>{label}</dt><dd>{formatCurrencyFromCents(Number(amount))}</dd></div>)}<div className="flex justify-between border-t border-[#ddcfbb] pt-4 text-base font-semibold text-[#242b25]"><dt>Order total (USD)</dt><dd>{formatCurrencyFromCents(totalCents)}</dd></div></dl>
        {provider !== "stripe" && options.rate && <div className="mt-5 rounded-xl bg-[#f3f5ef] p-4"><div className="flex flex-wrap justify-between gap-2 font-semibold text-[#31554d]"><span>You pay in NPR</span><span>{payable}</span></div><p className="mt-2 text-xs leading-5 text-neutral-600">Merchant conversion rate: USD 1 = NPR {options.rate}. This is the amount sent to {provider === "esewa" ? "eSewa" : "Khalti"}.</p>{options.sandbox && <p className="mt-2 text-xs font-semibold text-amber-800">Test payment — no live charge</p>}</div>}
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={isLoading || !options[provider]} className="mt-6 min-h-12 w-full rounded-full bg-[#b9472f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#923622] disabled:cursor-not-allowed disabled:bg-neutral-300">{isLoading ? "Connecting to secure payment…" : `Pay ${payable} →`}</button>
        <p className="mt-4 text-center text-xs leading-5 text-neutral-500">By continuing, you agree to our <Link href="/terms" className="underline">terms</Link>. Read our <Link href="/returns" className="underline">returns policy</Link>.</p>
        <div className="mt-6 border-t border-[#ddcfbb] pt-5 text-center text-sm text-[#31554d]">A question about your order? <Link href="/contact" className="font-semibold underline underline-offset-4">We’re here to help.</Link></div>
      </aside>
    </div>
  </form>;
}
