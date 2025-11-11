import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { getFeaturedProducts } from "@/lib/product-service";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="space-y-24 pb-24">
      <section className="bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-24 md:flex-row md:items-center md:gap-16">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center rounded-full bg-[#ffe1ef] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8a2040]">
              Hand-painted traditions
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-[#40111f] md:text-5xl">
              Experience Janakpur Art and Craft—custodians of Mithila artistry since 1993.
            </h1>
            <p className="text-lg text-neutral-700">
              Discover vibrant Madhubani paintings, handwoven textiles, and hand-crafted decor inspired by the stories
              and festivals of Janakpur. Each piece celebrates the artisans who bring this heritage to life.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
              >
                Explore the gallery
              </Link>
              <Link
                href="/products?filter=featured"
                className="rounded-full border border-[#8a2040]/40 px-6 py-3 text-sm font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
              >
                Meet the artisans
              </Link>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <div className="relative h-80 w-full max-w-sm overflow-hidden rounded-3xl border-4 border-[#f7b42c] bg-gradient-to-br from-[#f5d0a9] via-[#f7a3c5] to-[#f45a8d] p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598965402089-897ce52e835b?auto=format&fit=crop&w=800&q=80')] opacity-30 mix-blend-overlay" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-yellow-100">Festival collection</p>
                  <h2 className="text-3xl font-semibold">Rangoli Reverie</h2>
                  <p className="text-sm text-yellow-50">
                    Limited-edition wall plates and textiles inspired by the harvest season and the grace of Maithili
                    folklore.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.35em] text-yellow-50">Ethically crafted</p>
                  <p className="text-sm text-yellow-100">
                    Sustainably sourced materials directly supporting women-led artisan collectives across Janakpur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">
            Our Story
          </p>
          <h2 className="text-3xl font-semibold text-[#40111f]">Rooted in Janakpur’s cultural renaissance</h2>
          <p className="text-sm leading-relaxed text-neutral-700">
            Founded by Ajit Kumar Sah in 1993, Janakpur Art and Craft was established to promote and preserve
            traditional Mithila artistry while empowering artisan families across Nepal. From its beginnings in
            Shankhamul, Kathmandu, the collective has grown into a globally trusted exporter of Mithila crafts, jewellery,
            vessels, textiles, and paintings—all lovingly handmade with heritage techniques passed down through
            generations.
          </p>
          <p className="text-sm leading-relaxed text-neutral-700">
            By partnering with under-served communities and cultural societies throughout Janakpur, we ensure steady
            livelihoods, fair wages, and international visibility for the artisans who keep Mithila’s stories alive in every
            brushstroke.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl border border-[#f6b2c5]/50 bg-[#ffe1ef]/60 px-5 py-3 text-sm font-semibold text-[#8a2040]">
              Established 1993
            </div>
            <div className="rounded-2xl border border-[#f6b2c5]/50 bg-[#ffe1ef]/60 px-5 py-3 text-sm font-semibold text-[#8a2040]">
              Family-led artisan collective
            </div>
            <div className="rounded-2xl border border-[#f6b2c5]/50 bg-[#ffe1ef]/60 px-5 py-3 text-sm font-semibold text-[#8a2040]">
              Exporting worldwide
            </div>
          </div>
        </div>
        <div className="space-y-5 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-[#40111f]">Commitment to quality</h3>
          <ul className="space-y-4 text-sm text-neutral-700">
            <li>
              <span className="font-semibold text-[#8a2040]">Generational craftsmanship:</span> Handmade products crafted
              by expert artisans who uphold traditional Mithila workmanship and motifs.
            </li>
            <li>
              <span className="font-semibold text-[#8a2040]">Ethical sourcing:</span> Supporting women-led collectives
              and under-privileged communities with sustainable, regular income opportunities.
            </li>
            <li>
              <span className="font-semibold text-[#8a2040]">Global trust:</span> Supplying high-quality Mithila art to
              clients across the USA, Europe, Australia, Japan, and beyond, with meticulous attention to timely delivery.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#40111f]">Featured Mithila creations</h2>
            <p className="text-sm text-neutral-600">
              Handpicked treasures that celebrate ancestral motifs, natural dyes, and the spirit of Janakpur.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[#8a2040] transition hover:text-[#6f1731]"
          >
            View all
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-[#8a2040]/30 bg-white/70 p-10 text-sm text-neutral-600">
            Our artisans are crafting new pieces. Please check back soon to discover the next chapter of Mithila art.
          </p>
        )}
      </section>
    </div>
  );
}
