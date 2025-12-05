import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Learn about Janakpur Art and Craft's journey since 1993, our mission to preserve Mithila artistry, and our commitment to empowering artisan communities in Nepal.",
  openGraph: {
    title: "Our Story | Janakpur Art and Craft",
    description:
      "Founded in 1993, Janakpur Art and Craft preserves traditional Mithila artistry while empowering artisan families across Nepal.",
    url: getCanonicalUrl("/about"),
  },
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Our Story", href: "/about" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Our Heritage</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Rooted in Janakpur&apos;s cultural renaissance</h1>
        </div>

        <div className="prose prose-sm max-w-none space-y-4 text-neutral-700">
          <p>
            Founded in 1993 by Ajit Kumar Sah, Janakpur Art and Craft emerged from a deep commitment to preserving
            traditional Mithila artistry while creating sustainable livelihoods for artisan families across Nepal. What
            began as a small workshop in Shankhamul has grown into a trusted collective that exports heritage jewellery,
            vessels, textiles, and paintings to admirers worldwide.
          </p>

          <p>
            Our mission extends beyond commerce. We partner with communities and cultural societies throughout Janakpur
            to secure steady income opportunities and fair wages for the artisans who keep Mithila&apos;s stories alive in
            every brushstroke, every thread, and every handcrafted detail.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Our Values</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold text-[#8a2040]">Generational Craftsmanship</h3>
            <p className="text-sm text-neutral-700">
              Every piece is handmade by artisans who uphold traditional Mithila motifs, passed down through generations
              of master craftspeople.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#8a2040]">Ethical Sourcing</h3>
            <p className="text-sm text-neutral-700">
              We prioritize steady income opportunities for women-led collectives and underrepresented communities,
              ensuring fair wages and safe working conditions.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#8a2040]">Global Trust</h3>
            <p className="text-sm text-neutral-700">
              We deliver museum-grade Mithila art to clients worldwide with meticulous attention to detail and
              uncompromising quality standards.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#8a2040]">Cultural Preservation</h3>
            <p className="text-sm text-neutral-700">
              By supporting artisans, we help preserve the rich cultural heritage of Mithila art for future generations
              to appreciate and learn from.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#40111f]">Our Journey</h2>
        <div className="space-y-4 text-sm text-neutral-700">
          <div className="flex gap-4">
            <span className="font-semibold text-[#8a2040]">1993</span>
            <p>Founded by Ajit Kumar Sah in Shankhamul, Kathmandu, with a vision to promote Mithila art globally.</p>
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-[#8a2040]">2000s</span>
            <p>
              Expanded partnerships with artisan collectives across Janakpur and Dhanusha District, establishing direct
              trade relationships.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-[#8a2040]">2010s</span>
            <p>
              Launched international export programs, bringing Mithila artistry to galleries and collectors worldwide.
            </p>
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-[#8a2040]">Today</span>
            <p>
              Continuing to champion Janakpur&apos;s Mithila artisans through online platforms, ensuring their craft reaches
              a global audience while supporting local communities.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#8a2040]/50 bg-[#8a2040] p-8 text-white">
        <h2 className="text-2xl font-semibold">Join Our Mission</h2>
        <p className="mt-3 text-rose-100">
          Every purchase supports the artisans who bring Mithila&apos;s vibrant stories to life. Explore our collection of
          handcrafted treasures and become part of a movement that celebrates cultural heritage while empowering
          communities.
        </p>
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#8a2040] transition hover:bg-rose-50"
          >
            Explore Our Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

