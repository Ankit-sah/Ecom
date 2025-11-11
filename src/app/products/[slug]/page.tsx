import Image from "next/image";
import type { Metadata } from "next";

import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { getAllProducts, getProductBySlug } from "@/lib/product-service";
import { formatCurrencyFromCents } from "@/utils/format";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  return {
    title: product.name,
    description: product.description ?? "Discover more from our collection.",
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-500">No image available</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1).map((image, index) => (
                <div key={image} className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200">
                  <Image
                    src={image}
                    alt={`${product.name} image ${index + 2}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">
                {product.category?.name ?? "Mithila Collection"}
              </p>
              {product.artisan ? (
                <span className="rounded-full border border-[#f6b2c5]/70 px-3 py-1 text-[11px] font-semibold text-[#8a2040]">
                  Crafted by {product.artisan.name}
                </span>
              ) : null}
              <span className="rounded-full border border-[#f6b2c5]/70 px-3 py-1 text-[11px] font-semibold text-[#8a2040]">
                SKU: {product.sku}
              </span>
            </div>
            <h1 className="text-4xl font-semibold text-[#40111f]">{product.name}</h1>
            <p className="text-sm text-neutral-600">{product.description}</p>
            <p className="text-sm font-medium text-neutral-500">
              Catalog slug: <span className="text-[#8a2040]">{product.slug}</span>
            </p>
          </div>

          <ProductDetailActions product={product} />

          <div className="space-y-4 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8">
            <h2 className="text-lg font-semibold text-[#40111f]">Why it’s special</h2>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>• Handcrafted in Janakpur using generations-old Mithila techniques.</li>
              <li>• Natural pigments sourced from flowers, clay, and local minerals.</li>
              <li>• Each piece supports women-led artisan collectives in the region.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[#8a2040]/50 bg-[#8a2040] p-8 text-white">
            <h2 className="text-lg font-semibold">Ethical sourcing promise</h2>
            <p className="mt-2 text-sm text-rose-100">
              Fair wages, safe workshops, and reinvestment into artisan communities are at the heart of every Janakpur
              Art and Craft purchase, shipped with care to collectors across the globe.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-10">
        <h2 className="text-xl font-semibold text-[#40111f]">Product details</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Category</dt>
            <dd className="mt-2 text-sm text-neutral-700">{product.category?.name ?? "Mithila Art"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Artisan</dt>
            <dd className="mt-2 text-sm text-neutral-700">
              {product.artisan?.name ?? "Janakpur Art and Craft Collective"}
              {product.artisan?.location ? ` • ${product.artisan.location}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Price</dt>
            <dd className="mt-2 text-sm text-[#8a2040]">{formatCurrencyFromCents(product.priceCents)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Availability</dt>
            <dd className="mt-2 text-sm text-neutral-700">
              {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Created & updated</dt>
            <dd className="mt-2 text-sm text-neutral-700">
              {new Date(product.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

