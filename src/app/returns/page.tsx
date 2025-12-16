import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "Learn about our return policy, exchange process, and how to return items from Janakpur Art and Craft.",
  openGraph: {
    title: "Returns & Exchanges | Janakpur Art and Craft",
    description: "Our return policy and exchange process for your peace of mind.",
    url: getCanonicalUrl("/returns"),
  },
  alternates: {
    canonical: getCanonicalUrl("/returns"),
  },
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Returns", href: "/returns" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Return Policy</p>
          <h1 className="text-4xl font-semibold text-gray-800">Returns & Exchanges</h1>
          <p className="text-neutral-600">
            We want you to be completely satisfied with your purchase. If you&apos;re not happy, we&apos;re here to help.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">Return Policy</h2>
        <div className="mt-6 space-y-4 text-sm text-neutral-700">
          <div>
            <h3 className="font-semibold text-orange-500">30-Day Return Window</h3>
            <p>
              You have 30 days from the date of delivery to return items in their original condition, unused and with
              all original packaging and tags.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500">Eligible Items</h3>
            <p>
              Most items can be returned. Custom or personalized items, as well as items damaged due to misuse, are not
              eligible for return.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-500">Return Process</h3>
            <ol className="ml-4 list-decimal space-y-2">
              <li>Contact us at returns@janakpurartandcraft.com with your order number</li>
              <li>We&apos;ll provide a return authorization and shipping instructions</li>
              <li>Package the item securely in its original packaging</li>
              <li>Ship the item back to us using the provided return label</li>
              <li>Once received, we&apos;ll process your refund within 5-7 business days</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">Exchanges</h2>
        <div className="mt-6 space-y-3 text-sm text-neutral-700">
          <p>
            We&apos;re happy to exchange items for a different size, color, or style, subject to availability. Exchanges
            follow the same 30-day window and condition requirements as returns.
          </p>
          <p>
            To request an exchange, please{" "}
            <Link href="/contact" className="font-semibold text-orange-500 hover:underline">
              contact us
            </Link>{" "}
            with your order number and the item you&apos;d like to exchange for.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">Refunds</h2>
        <div className="mt-6 space-y-3 text-sm text-neutral-700">
          <p>
            Refunds will be issued to the original payment method within 5-7 business days after we receive and inspect
            the returned item.
          </p>
          <p>
            Original shipping costs are non-refundable unless the return is due to our error or a defective item. Return
            shipping costs are the responsibility of the customer unless otherwise specified.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">Damaged or Defective Items</h2>
        <div className="mt-6 space-y-3 text-sm text-neutral-700">
          <p>
            If your item arrives damaged or defective, please contact us immediately with photos of the damage. We&apos;ll
            arrange for a replacement or full refund, including return shipping costs.
          </p>
          <p>
            Please inspect your items upon delivery and report any issues within 48 hours of receipt.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-500/50 bg-[text-bg-orange-500] p-8 text-white">
        <h2 className="text-2xl font-semibold">Need Help?</h2>
        <p className="mt-3 text-rose-100">
          If you have questions about returns or need assistance, please{" "}
          <Link href="/contact" className="font-semibold underline hover:text-white">
            contact us
          </Link>{" "}
          and we&apos;ll be happy to help.
        </p>
      </section>
    </div>
  );
}

