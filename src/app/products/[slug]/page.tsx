import type { Metadata } from "next";
import Script from "next/script";

import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { RelatedProducts } from "@/components/products/related-products";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/product-service";
import { getProductDetails } from "@/lib/product-details";
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
  const details = getProductDetails(product);
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
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-4 sm:py-12 md:space-y-10 md:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name, href: `/products/${slug}` },
          ]}
        />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <ProductGallery images={product.images} name={product.name} category={product.category?.name} artisan={product.artisan?.name} />

        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b9472f]">
                {product.category?.name ?? "Mithila Collection"}
              </p>
              {product.artisan ? (
                <span className="rounded-full border border-[#ddcfbb] px-3 py-1 text-[10px] font-semibold text-[#31554d]">
                  Crafted by {product.artisan.name}
                </span>
              ) : null}
              <span className="rounded-full border border-[#ddcfbb] px-3 py-1 text-[10px] font-semibold text-[#31554d]">
                SKU: {product.sku}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-tight text-[#242b25] sm:text-4xl md:text-5xl">{product.name}</h1>
            <p className="text-sm leading-6 text-neutral-600">{product.description}</p>
            <p className="text-sm leading-6 text-neutral-600">Each work is handmade; slight shifts in colour and pattern make your piece one of a kind.</p>
          </div>

          <ProductDetailActions product={product} />

          <section className="rounded-2xl border border-[#ddcfbb] bg-[#f3f5ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#31554d]">Delivery</p>
            <p className="mt-2 font-semibold text-[#242b25]">{details.dispatch}</p>
            <p className="mt-1 text-sm leading-6 text-neutral-600">{details.delivery}</p>
          </section>

          <div className="space-y-4 rounded-3xl border border-[#ddcfbb] bg-[#fffdf9] p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#242b25]">Why it’s special</h2>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>• Handcrafted in Janakpur using generations-old Mithila techniques.</li>
              <li>• Natural pigments sourced from flowers, clay, and local minerals.</li>
              <li>• Each piece supports women-led artisan collectives in the region.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-orange-500/50 bg-orange-500 p-8 text-white">
            <h2 className="text-lg font-semibold">Ethical sourcing promise</h2>
            <p className="mt-2 text-sm text-rose-100">
              Fair wages, safe workshops, and reinvestment into artisan communities are at the heart of every Janakpur
              Art and Craft purchase, shipped with care to collectors across the globe.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#ddcfbb] bg-white p-6 sm:p-10">
        <h2 className="font-serif text-3xl text-[#242b25]">Details for your piece</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[["Materials", details.materials], ["Dimensions", details.dimensions], ["Care", details.care]].map(([label, value]) => <section key={label} className="rounded-2xl bg-[#fbf6ed] p-5"><h3 className="text-sm font-semibold text-[#31554d]">{label}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{value}</p></section>)}
        </div>
        <h2 className="mt-10 text-xl font-semibold text-gray-800">Product information</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Category</dt>
            <dd className="mt-2 text-sm text-neutral-700">{product.category?.name ?? "Mithila Art"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Artisan</dt>
            <dd className="mt-2 text-sm text-neutral-700">
              {product.artisan?.name ?? "Janakpur Art and Craft Collective"}
              {product.artisan?.location ? ` • ${product.artisan.location}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Origin</dt>
            <dd className="mt-2 text-sm text-neutral-700">{details.origin}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Price</dt>
            <dd className="mt-2 text-sm text-orange-500">{formatCurrencyFromCents(product.priceCents)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Availability</dt>
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
            <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Created & updated</dt>
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
