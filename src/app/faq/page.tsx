import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about Janakpur Art and Craft products, shipping, orders, and more.",
  openGraph: {
    title: "FAQ | Janakpur Art and Craft",
    description: "Answers to common questions about our products, shipping, and orders.",
    url: getCanonicalUrl("/faq"),
  },
  alternates: {
    canonical: getCanonicalUrl("/faq"),
  },
};

const faqs = [
  {
    category: "Products",
    questions: [
      {
        q: "Are all products handmade?",
        a: "Yes, all our products are handcrafted by skilled artisans in Janakpur and surrounding regions using traditional Mithila techniques passed down through generations.",
      },
      {
        q: "What materials are used?",
        a: "We use natural materials including terracotta, natural dyes from flowers and minerals, organic cotton, and traditional pigments. Each product listing includes detailed material information.",
      },
      {
        q: "Can I request custom or personalized items?",
        a: "Yes, we offer custom orders for many of our products. Please contact us with your requirements and we'll work with our artisans to create something special for you.",
      },
    ],
  },
  {
    category: "Orders & Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards and debit cards through our secure Stripe checkout. Payment is processed securely and your financial information is never stored on our servers.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, you'll receive an email with a tracking number. You can use this to monitor your package's journey. For international orders, tracking may be limited once the package enters your country's postal system.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "If you need to modify or cancel your order, please contact us as soon as possible. Orders that have already been processed or shipped cannot be cancelled, but we can help with returns or exchanges.",
      },
    ],
  },
  {
    category: "Shipping",
    questions: [
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship worldwide. International shipping costs and delivery times vary by destination. Shipping costs are calculated at checkout based on your location and order weight.",
      },
      {
        q: "How long does shipping take?",
        a: "Domestic orders (Nepal) typically arrive in 3-7 business days. International orders usually take 7-21 business days, depending on the destination and customs processing.",
      },
      {
        q: "Will I be charged customs or import duties?",
        a: "International orders may be subject to customs duties and taxes, which are the responsibility of the customer. These charges vary by country and are determined by your local customs authority.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "You have 30 days from delivery to return items in their original condition. Custom or personalized items are not eligible for return. Please see our Returns page for complete details.",
      },
      {
        q: "How do I return an item?",
        a: "Contact us at returns@janakpurartandcraft.com with your order number. We'll provide return authorization and shipping instructions. Once we receive the item, we'll process your refund within 5-7 business days.",
      },
      {
        q: "Can I exchange an item?",
        a: "Yes, we're happy to exchange items for a different size, color, or style, subject to availability. Exchanges follow the same 30-day window and condition requirements as returns.",
      },
    ],
  },
  {
    category: "Care & Maintenance",
    questions: [
      {
        q: "How do I care for my Mithila art pieces?",
        a: "Care instructions vary by product type. Generally, keep items away from direct sunlight and excessive moisture. Textiles should be hand-washed or dry-cleaned. Ceramic and terracotta items should be handled with care. Specific care instructions are included with each product.",
      },
      {
        q: "Are the colors fade-resistant?",
        a: "Our products use traditional natural dyes which may fade slightly over time with exposure to sunlight. This is part of the natural aging process of authentic Mithila art. To preserve colors, display items away from direct sunlight.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "FAQ", href: "/faq" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Help Center</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Frequently Asked Questions</h1>
          <p className="text-neutral-600">
            Find answers to common questions about our products, orders, shipping, and more.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {faqs.map((category) => (
          <section key={category.category} className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#40111f]">{category.category}</h2>
            <div className="mt-6 space-y-6">
              {category.questions.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-[#8a2040]">{faq.q}</h3>
                  <p className="text-sm text-neutral-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-[#8a2040]/50 bg-[#8a2040] p-8 text-white">
        <h2 className="text-2xl font-semibold">Still Have Questions?</h2>
        <p className="mt-3 text-rose-100">
          Can't find what you're looking for?{" "}
          <a href="/contact" className="font-semibold underline hover:text-white">
            Contact us
          </a>{" "}
          and we'll be happy to help.
        </p>
      </section>
    </div>
  );
}

