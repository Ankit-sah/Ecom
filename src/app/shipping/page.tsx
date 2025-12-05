import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Shipping Information",
  description:
    "Learn about shipping rates, delivery times, and international shipping options for Janakpur Art and Craft orders.",
  openGraph: {
    title: "Shipping Information | Janakpur Art and Craft",
    description: "Shipping rates, delivery times, and international shipping options for your orders.",
    url: getCanonicalUrl("/shipping"),
  },
  alternates: {
    canonical: getCanonicalUrl("/shipping"),
  },
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shipping", href: "/shipping" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Delivery Information</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Shipping & Delivery</h1>
          <p className="text-neutral-600">
            We carefully package and ship each handcrafted piece to ensure it arrives safely at your doorstep.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Shipping Rates</h2>
        <div className="mt-6 space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-[#8a2040]">Nepal Domestic</h3>
              <p className="text-neutral-700">
                Standard shipping: NPR 200-500
                <br />
                Express shipping: NPR 500-1000
                <br />
                Delivery: 3-7 business days
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-[#8a2040]">International</h3>
              <p className="text-neutral-700">
                Standard: $15-30 USD
                <br />
                Express: $30-60 USD
                <br />
                Delivery: 7-21 business days
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            *Shipping costs are calculated at checkout based on your location and order weight. International orders may
            be subject to customs duties and taxes.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Processing & Delivery Times</h2>
        <div className="mt-6 space-y-4 text-sm text-neutral-700">
          <div>
            <h3 className="font-semibold text-[#8a2040]">Order Processing</h3>
            <p>Orders are typically processed within 1-3 business days. Custom or made-to-order items may take 2-4 weeks.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#8a2040]">Domestic Delivery (Nepal)</h3>
            <p>Standard shipping: 3-7 business days | Express: 1-3 business days</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#8a2040]">International Delivery</h3>
            <p>
              Standard: 7-21 business days | Express: 3-7 business days
              <br />
              Delivery times vary by destination and customs processing.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Packaging & Care</h2>
        <div className="mt-6 space-y-3 text-sm text-neutral-700">
          <p>
            Each handcrafted piece is carefully wrapped in protective materials and shipped in sturdy boxes to ensure it
            arrives in perfect condition. We use eco-friendly packaging materials whenever possible.
          </p>
          <p>
            Fragile items like wall plates and ceramics receive extra padding and are clearly marked for careful
            handling.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Tracking Your Order</h2>
        <div className="mt-6 space-y-3 text-sm text-neutral-700">
          <p>
            Once your order ships, you'll receive a tracking number via email. You can use this to monitor your package's
            journey from our workshop to your door.
          </p>
          <p>
            For international orders, tracking may be limited once the package enters your country's postal system.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#8a2040]/50 bg-[#8a2040] p-8 text-white">
        <h2 className="text-2xl font-semibold">Questions About Shipping?</h2>
        <p className="mt-3 text-rose-100">
          If you have specific questions about shipping to your location or need expedited delivery, please{" "}
          <a href="/contact" className="font-semibold underline hover:text-white">
            contact us
          </a>{" "}
          and we'll be happy to help.
        </p>
      </section>
    </div>
  );
}

