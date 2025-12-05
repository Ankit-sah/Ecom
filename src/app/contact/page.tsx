import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Janakpur Art and Craft. We're here to help with questions about our products, orders, shipping, or partnerships.",
  openGraph: {
    title: "Contact Us | Janakpur Art and Craft",
    description: "Get in touch with Janakpur Art and Craft for questions about products, orders, or partnerships.",
    url: getCanonicalUrl("/contact"),
  },
  alternates: {
    canonical: getCanonicalUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Get in Touch</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Contact Janakpur Art and Craft</h1>
          <p className="text-neutral-600">
            Have questions about our products, orders, or partnerships? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-6 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#40111f]">Contact Information</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-[#8a2040]">Email</h3>
              <p className="text-neutral-700">
                <a href="mailto:info@janakpurartandcraft.com" className="hover:text-[#8a2040]">
                  info@janakpurartandcraft.com
                </a>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#8a2040]">Phone</h3>
              <p className="text-neutral-700">
                <a href="tel:+977-1-XXXXXXX" className="hover:text-[#8a2040]">
                  +977-1-XXXXXXX
                </a>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#8a2040]">Location</h3>
              <p className="text-neutral-700">
                Shankhamul, Kathmandu
                <br />
                Janakpur, Nepal
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#8a2040]">Business Hours</h3>
              <p className="text-neutral-700">
                Monday - Friday: 9:00 AM - 6:00 PM NPT
                <br />
                Saturday: 10:00 AM - 4:00 PM NPT
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#40111f]">Quick Links</h2>
          <div className="space-y-3 text-sm">
            <Link href="/shipping" className="block text-neutral-700 hover:text-[#8a2040]">
              Shipping Information →
            </Link>
            <Link href="/returns" className="block text-neutral-700 hover:text-[#8a2040]">
              Returns & Exchanges →
            </Link>
            <Link href="/faq" className="block text-neutral-700 hover:text-[#8a2040]">
              Frequently Asked Questions →
            </Link>
            <Link href="/products" className="block text-neutral-700 hover:text-[#8a2040]">
              Browse Products →
            </Link>
            <Link href="/about" className="block text-neutral-700 hover:text-[#8a2040]">
              Our Story →
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Partnerships & Wholesale</h2>
        <p className="mt-3 text-sm text-neutral-700">
          Interested in partnering with us or placing wholesale orders? We work with galleries, retailers, and cultural
          institutions worldwide. Please contact us at{" "}
          <a href="mailto:partnerships@janakpurartandcraft.com" className="font-semibold text-[#8a2040] hover:underline">
            partnerships@janakpurartandcraft.com
          </a>{" "}
          to discuss opportunities.
        </p>
      </section>
    </div>
  );
}

