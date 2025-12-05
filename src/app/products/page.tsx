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

  const [products, categories, artisans] = await Promise.all([
    getFilteredProducts(filters),
    getAllCategories(),
    getAllArtisans(),
  ]);

  const maxPrice = products.length > 0 
    ? Math.max(...products.map((p) => p.priceCents)) / 100 
    : 1000;

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
      <div className="space-y-12 px-4 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
          ]}
        />

        <section className="mx-auto flex max-w-6xl flex-col gap-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a2040]">Mithila marketplace</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">All handcrafted treasures</h1>
          <p className="mx-auto max-w-2xl text-sm text-neutral-600">
            Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery,
            textiles, and decor crafted in Janakpur and destined for admirers around the world.
          </p>
        </section>

        <section className="mx-auto max-w-6xl">
          <div className="mb-6">
            <ProductSearch />
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <ProductFilters categories={categories} artisans={artisans} maxPrice={maxPrice} />
            </aside>

            <div className="space-y-6">
              {products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#8a2040]/40 bg-white/70 p-16 text-center">
                  <p className="text-sm text-neutral-600">
                    No products found matching your criteria.{" "}
                    <Link href="/products" className="font-semibold text-[#8a2040] underline-offset-2 hover:underline">
                      Clear filters
                    </Link>{" "}
                    or{" "}
                    <Link href="/" className="font-semibold text-[#8a2040] underline-offset-2 hover:underline">
                      visit the home page
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-neutral-600">
                    Showing {products.length} {products.length === 1 ? "product" : "products"}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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

