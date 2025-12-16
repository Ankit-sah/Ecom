"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { Stripe as StripeJs } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/providers/cart-provider";
import { formatCurrencyFromCents } from "@/utils/format";

const getStripe = (): Promise<StripeJs | null> => {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return Promise.resolve(null);
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

type ShippingForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function CheckoutPageClient() {
  const { items, subtotalCents, totalQuantity } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"domestic" | "international">("domestic");
  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "NP",
  });

  const taxEstimateCents = useMemo(() => Math.round(subtotalCents * 0.08), [subtotalCents]);
  const shippingCents = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }
    const base = shippingMethod === "domestic" ? 800 : 2500;
    const variableRate = shippingMethod === "domestic" ? 0.05 : 0.12;
    return Math.max(base, Math.round(subtotalCents * variableRate));
  }, [items.length, shippingMethod, subtotalCents]);
  const totalCents = useMemo(
    () => subtotalCents + taxEstimateCents + shippingCents,
    [subtotalCents, taxEstimateCents, shippingCents],
  );

  // Redirect to success page if we have a session_id (from Stripe redirect)
  useEffect(() => {
    if (sessionId) {
      window.location.href = `/checkout/success?session_id=${sessionId}`;
    }
  }, [sessionId]);

  const handleCheckout = async () => {
    if (!shipping.fullName || !shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
      setError("Please complete the required shipping fields.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate stock before proceeding to checkout
      const stockResponse = await fetch("/api/products/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!stockResponse.ok) {
        throw new Error("Failed to validate stock availability.");
      }

      const stockData = (await stockResponse.json()) as {
        allAvailable: boolean;
        items: Array<{
          productId: string;
          name?: string;
          available: boolean;
          error?: string | null;
        }>;
      };

      if (!stockData.allAvailable) {
        const unavailableItems = stockData.items
          .filter((item) => !item.available)
          .map((item) => item.name || item.productId);
        throw new Error(
          `Some items are no longer available in the requested quantities: ${unavailableItems.join(", ")}. Please update your cart.`
        );
      }

      const stripeClient = await getStripe();
      if (!stripeClient) {
        throw new Error("Stripe publishable key is missing. Check your environment variables.");
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shippingMethod,
          shippingCents,
          shippingAddress: shipping,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const errorMessage = result.details 
          ? Array.isArray(result.details) 
            ? result.details.join(", ")
            : result.details
          : result.error ?? "Unable to initiate checkout.";
        throw new Error(errorMessage);
      }

      const { sessionId, url } = (await response.json()) as {
        sessionId?: string;
        url?: string;
      };

      if (url) {
        window.location.href = url;
        return;
      }

      if (!sessionId) {
        throw new Error("Stripe session ID was not returned.");
      }

      const { error: stripeError } = await (stripeClient as unknown as { redirectToCheckout: (params: { sessionId: string }) => Promise<{ error?: { message: string } }> }).redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionId && items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-dashed border-orange-500/40 bg-white/75 p-16 text-center">
        <p className="text-2xl font-semibold text-gray-800">Your cart is empty</p>
        <p className="text-sm text-neutral-600">Add Mithila creations to your cart before proceeding to checkout.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section className="space-y-6 rounded-3xl border border-orange-200 bg-white/85 p-6 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-800">Checkout</h1>
          <p className="text-sm text-neutral-600">
            Review your Mithila selections, confirm shipping, and secure payment via Stripe.
          </p>
        </header>

        <>
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex items-center justify-between gap-6 rounded-2xl border border-orange-200/50 bg-white/85 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-neutral-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-500">
                    {formatCurrencyFromCents(item.product.priceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-4 rounded-2xl border border-orange-200/60 bg-white/70 p-4">
              <h2 className="text-lg font-semibold text-gray-800">Shipping details</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  placeholder="Full name*"
                  value={shipping.fullName}
                  onChange={(event) => setShipping((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  placeholder="Phone"
                  value={shipping.phone}
                  onChange={(event) => setShipping((prev) => ({ ...prev, phone: event.target.value }))}
                  className="rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Address line 1*"
                  value={shipping.addressLine1}
                  onChange={(event) => setShipping((prev) => ({ ...prev, addressLine1: event.target.value }))}
                  className="md:col-span-2 rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  placeholder="Address line 2"
                  value={shipping.addressLine2}
                  onChange={(event) => setShipping((prev) => ({ ...prev, addressLine2: event.target.value }))}
                  className="md:col-span-2 rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="City*"
                  value={shipping.city}
                  onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
                  className="rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  placeholder="State/Province"
                  value={shipping.state}
                  onChange={(event) => setShipping((prev) => ({ ...prev, state: event.target.value }))}
                  className="rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Postal code*"
                  value={shipping.postalCode}
                  onChange={(event) => setShipping((prev) => ({ ...prev, postalCode: event.target.value }))}
                  className="rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
                <input
                  placeholder="Country"
                  value={shipping.country}
                  onChange={(event) => setShipping((prev) => ({ ...prev, country: event.target.value }))}
                  className="rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Shipping method</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm">
                    <span>
                      Domestic courier
                      <span className="block text-xs text-neutral-500">Dispatch from Kathmandu hub (3–5 days)</span>
                    </span>
                    <input
                      type="radio"
                      checked={shippingMethod === "domestic"}
                      onChange={() => setShippingMethod("domestic")}
                      className="h-4 w-4 border-orange-200/60 text-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-orange-200/60 bg-white px-3 py-2 text-sm">
                    <span>
                      International express
                      <span className="block text-xs text-neutral-500">Insured DHL/FedEx service (5–10 days)</span>
                    </span>
                    <input
                      type="radio"
                      checked={shippingMethod === "international"}
                      onChange={() => setShippingMethod("international")}
                      className="h-4 w-4 border-orange-200/60 text-orange-500"
                    />
                  </label>
                </div>
              </div>
            </div>
        </>
      </section>

      <aside className="space-y-6 rounded-3xl border border-orange-200 bg-white/85 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Order summary</h2>
          <p className="text-sm text-neutral-600">Items ({totalQuantity})</p>
        </div>
        <dl className="space-y-3 text-sm text-neutral-700">
          <div className="flex items-center justify-between">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-orange-500">{formatCurrencyFromCents(subtotalCents)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Estimated tax</dt>
            <dd className="font-semibold text-orange-500">{formatCurrencyFromCents(taxEstimateCents)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Shipping</dt>
            <dd className="font-semibold text-orange-500">
              {items.length > 0 ? formatCurrencyFromCents(shippingCents) : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-orange-200/60 pt-3 text-base font-semibold text-gray-800">
            <dt>Total</dt>
            <dd>{formatCurrencyFromCents(totalCents)}</dd>
          </div>
        </dl>
        {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {isLoading ? "Redirecting..." : "Complete purchase"}
        </button>
        <p className="text-xs text-neutral-500">
          Transactions are securely processed via Stripe. Payments empower Janakpur artisans—your card details are never stored on our servers.
        </p>
      </aside>
    </div>
  );
}

