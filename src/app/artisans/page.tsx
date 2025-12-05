import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { prisma } from "@/lib/prisma";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Our Artisans",
  description:
    "Meet the talented artisans behind Janakpur Art and Craft. Learn about the skilled craftspeople who create our handcrafted Mithila art pieces.",
  openGraph: {
    title: "Our Artisans | Janakpur Art and Craft",
    description: "Meet the talented artisans who create our handcrafted Mithila art pieces.",
    url: getCanonicalUrl("/artisans"),
  },
  alternates: {
    canonical: getCanonicalUrl("/artisans"),
  },
};

export default async function ArtisansPage() {
  const artisans = await prisma.artisan.findMany({
    include: {
      products: {
        where: { published: true },
        take: 3,
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Artisans", href: "/artisans" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Meet the Makers</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Our Artisans</h1>
          <p className="text-neutral-600">
            Each piece in our collection is crafted by skilled artisans who preserve traditional Mithila techniques
            passed down through generations. Meet the talented individuals and collectives behind our handcrafted
            treasures.
          </p>
        </div>
      </section>

      {artisans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#8a2040]/40 bg-white/70 p-16 text-center">
          <p className="text-sm text-neutral-600">
            We're working on adding artisan profiles. Please check back soon to meet the makers behind our collection.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {artisans.map((artisan) => (
            <div
              key={artisan.id}
              className="flex flex-col rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-6 shadow-sm transition hover:shadow-lg"
            >
              {artisan.photoUrl ? (
                <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={artisan.photoUrl}
                    alt={artisan.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="mb-4 aspect-square rounded-2xl bg-gradient-to-br from-[#ffe1ef] to-[#f6b2c5] flex items-center justify-center">
                  <span className="text-4xl font-semibold text-[#8a2040]">
                    {artisan.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#40111f]">{artisan.name}</h2>
                  {artisan.location && (
                    <p className="text-sm text-neutral-600">{artisan.location}</p>
                  )}
                </div>

                {artisan.bio && (
                  <p className="text-sm text-neutral-700 line-clamp-3">{artisan.bio}</p>
                )}

                {artisan.products.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#b03d5e]">
                      Featured Works
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {artisan.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="relative aspect-square overflow-hidden rounded-lg border border-[#f6b2c5]/50"
                        >
                          {product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover transition hover:scale-105"
                              sizes="(max-width: 768px) 33vw, 11vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                              No image
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                    {artisan.products.length === 3 && (
                      <Link
                        href={`/products?artisan=${encodeURIComponent(artisan.name)}`}
                        className="text-xs font-semibold text-[#8a2040] hover:underline"
                      >
                        View all works →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

