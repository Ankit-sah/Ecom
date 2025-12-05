import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { prisma } from "@/lib/prisma";
import { getFilteredProducts } from "@/lib/product-service";
import { getCanonicalUrl, generateCollectionPageSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const categories = await prisma.productCategory.findMany({
    select: { slug: true },
  });
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.productCategory.findUnique({
    where: { slug },
  });

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.name,
    description: category.description || `Browse ${category.name} from Janakpur Art and Craft.`,
    openGraph: {
      title: `${category.name} | Janakpur Art and Craft`,
      description: category.description || `Browse ${category.name} from our collection.`,
      url: getCanonicalUrl(`/products/category/${slug}`),
    },
    alternates: {
      canonical: getCanonicalUrl(`/products/category/${slug}`),
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await prisma.productCategory.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const products = await getFilteredProducts({ category: slug });
  const collectionSchema = generateCollectionPageSchema(products);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: getCanonicalUrl("/") },
    { name: "Products", url: getCanonicalUrl("/products") },
    { name: category.name, url: getCanonicalUrl(`/products/category/${slug}`) },
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
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: category.name, href: `/products/category/${slug}` },
          ]}
        />

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">{category.name}</p>
            <h1 className="text-4xl font-semibold text-[#40111f]">{category.name}</h1>
            {category.description && (
              <p className="max-w-2xl text-sm text-neutral-600">{category.description}</p>
            )}
          </div>
        </section>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#8a2040]/40 bg-white/70 p-16 text-center">
            <p className="text-sm text-neutral-600">
              No products found in this category.{" "}
              <a href="/products" className="font-semibold text-[#8a2040] underline-offset-2 hover:underline">
                Browse all products
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

