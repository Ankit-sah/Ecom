import Image from "next/image";
import type { Metadata } from "next";
import Script from "next/script";

import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { RelatedProducts } from "@/components/products/related-products";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/product-service";
import { getCanonicalUrl, generateProductSchema, generateBreadcrumbSchema } from "@/lib/structured-data";
import { formatCurrencyFromCents } from "@/utils/format";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products
    .filter((product) => product.slug)
    .map((product) => ({
      slug: product.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    // If product not found, return default metadata
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  const productUrl = getCanonicalUrl(`/products/${slug}`);
  const productImage = product.images.length > 0 ? product.images[0] : undefined;

  return {
    title: product.name,
    description: product.description ?? `${product.name} - Handcrafted Mithila art from Janakpur, Nepal.`,
    keywords: [
      product.name,
      ...(product.tags || []),
      product.category?.name || "Mithila art",
      "handcrafted",
      "Janakpur",
      "Nepal",
    ],
    openGraph: {
      title: product.name,
      description: product.description ?? `${product.name} - Handcrafted Mithila art from Janakpur, Nepal.`,
      url: productUrl,
      type: "website",
      siteName: "Janakpur Art and Craft",
      images: product.images.length > 0
        ? product.images.map((img) => ({
            url: img,
            width: 1200,
            height: 1200,
            alt: product.name,
          }))
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? `${product.name} - Handcrafted Mithila art from Janakpur, Nepal.`,
      images: productImage ? [productImage] : [],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    // getProductBySlug calls notFound() which will redirect to 404
    // But if there's another error, we should handle it
    throw error;
  }
  const productUrl = getCanonicalUrl(`/products/${slug}`);
  
  const [relatedProducts] = await Promise.all([
    getRelatedProducts(
      product.id,
      product.category?.id || null,
      product.artisan?.id || null,
      4
    ),
  ]);
  
  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: getCanonicalUrl("/") },
    { name: "Products", url: getCanonicalUrl("/products") },
    { name: product.name, url: productUrl },
  ]);

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name, href: `/products/${slug}` },
          ]}
        />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={`${product.name}${product.category ? ` - ${product.category.name}` : ""}${product.artisan ? ` crafted by ${product.artisan.name}` : ""}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-500" aria-label="No image available">
                No image available
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1).map((image, index) => (
                <div key={image} className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200">
                  <Image
                    src={image}
                    alt={`${product.name} - Additional view ${index + 2}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
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
            <dd className="mt-2">
              {product.stock === 0 ? (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  Out of Stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  Only {product.stock} left in stock
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {product.stock} in stock
                </span>
              )}
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

      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} currentProductSlug={slug} />
      )}
    </div>
    </>
  );
}

