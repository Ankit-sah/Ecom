import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";

import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSearch } from "@/components/products/product-search";
import {
  getAllCategories,
  getAllArtisans,
  getFilteredProducts,
  getMaxPrice,
} from "@/lib/product-service";
import { getCanonicalUrl, generateCollectionPageSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Handcrafted Treasures",
  description:
    "Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery, textiles, and decor crafted in Janakpur and destined for admirers around the world.",
  openGraph: {
    title: "All Handcrafted Treasures | Janakpur Art and Craft",
    description:
      "Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery, textiles, and decor crafted in Janakpur.",
    url: getCanonicalUrl("/products"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Handcrafted Treasures | Janakpur Art and Craft",
    description:
      "Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery, textiles, and decor.",
  },
  alternates: {
    canonical: getCanonicalUrl("/products"),
  },
};

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    artisan?: string;
    minPrice?: string;
    maxPrice?: string;
    featured?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = {
    search: params.search,
    category: params.category,
    artisan: params.artisan,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    featured: params.featured === "true",
    sortBy: (params.sort as "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "oldest" | undefined) || "newest",
  };

  const [products, categories, artisans, maxPrice] = await Promise.all([
    getFilteredProducts(filters),
    getAllCategories(),
    getAllArtisans(),
    getMaxPrice(),
  ]);

  const collectionSchema = generateCollectionPageSchema(products);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: getCanonicalUrl("/") },
    { name: "Products", url: getCanonicalUrl("/products") },
  ]);

  return (
    <>
      <Script
        id="collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="space-y-8 px-4 py-8 sm:space-y-10 sm:px-4 sm:py-12 md:space-y-12 md:py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
          ]}
        />

        <section className="mx-auto max-w-6xl rounded-3xl border border-[#ddcfbb] bg-[#f5eadb] px-6 py-10 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b9472f]">Mithila marketplace</p>
          <h1 className="mt-3 font-serif text-4xl text-[#242b25] sm:text-5xl">All handcrafted treasures</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery,
            textiles, and decor crafted in Janakpur and destined for admirers around the world.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs font-semibold text-[#31554d]"><span>Handmade in Nepal</span><span>Fair artisan partnerships</span><span>Secure checkout</span></div>
        </section>

        <section className="mx-auto max-w-6xl">
          <div className="mb-6">
            <ProductSearch />
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
            <aside className="hidden lg:block">
              <ProductFilters categories={categories} artisans={artisans} maxPrice={maxPrice} />
            </aside>

            <div className="space-y-4 sm:space-y-6">
              <details className="rounded-2xl border border-[#ddcfbb] bg-white p-4 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-[#31554d]">Filter and sort the collection</summary>
                <div className="mt-4"><ProductFilters categories={categories} artisans={artisans} maxPrice={maxPrice} /></div>
              </details>
              {products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-500/40 bg-white/70 p-16 text-center">
                  <p className="text-sm text-neutral-600">
                    No products found matching your criteria.{" "}
                    <Link href="/products" className="font-semibold text-orange-500 underline-offset-2 hover:underline">
                      Clear filters
                    </Link>{" "}
                    or{" "}
                    <Link href="/" className="font-semibold text-orange-500 underline-offset-2 hover:underline">
                      visit the home page
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <p aria-live="polite" className="text-sm text-neutral-600">
                    {products.length} {products.length === 1 ? "piece" : "pieces"} ready to discover
                  </p>
                  <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
