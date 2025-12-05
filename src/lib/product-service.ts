import { notFound } from "next/navigation";

import type { Artisan, Product as ProductModel, ProductCategory, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type LegacyProductDoc = {
  _id: string | { $oid: string };
  name: string;
  slug?: string;
};

let hasMigratedLegacy = false;

/**
 * Migrates legacy products (products without SKUs) by generating SKUs for them.
 * This is a one-time migration for existing data.
 */
async function ensureLegacyProductsMigrated() {
  if (hasMigratedLegacy) {
    return;
  }

  const legacyResult = (await prisma.$runCommandRaw({
    aggregate: "Product",
    pipeline: [
      {
        $match: {
          $or: [{ sku: { $exists: false } }, { sku: null }, { sku: "" }],
        },
      },
      {
        $project: { _id: 1, name: 1, slug: 1 },
      },
    ],
    cursor: { batchSize: 50 },
  })) as { cursor?: { firstBatch?: LegacyProductDoc[] } };

  const legacyProducts = legacyResult.cursor?.firstBatch ?? [];

  if (legacyProducts.length > 0) {
    await Promise.all(
      legacyProducts.map((product) => {
        const id =
          typeof product._id === "string"
            ? product._id
            : product._id && typeof product._id === "object" && "$oid" in product._id
              ? (product._id.$oid as string)
              : null;

        if (!id) {
          return Promise.resolve();
        }

        const base = product.slug?.length ? product.slug : slugify(product.name);
        const sku = `${base}-${id.slice(-6)}`.toUpperCase();

        return prisma.product.update({
          where: { id },
          data: { sku },
        });
      }),
    );
  }

  hasMigratedLegacy = true;
}

export function toProductPayload(
  product: ProductModel & {
    category: ProductCategory | null;
    artisan: Artisan | null;
  },
): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    priceCents: product.priceCents,
    images: product.images ?? [],
    tags: product.tags ?? [],
    details: product.details as Record<string, unknown> | null,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description,
        }
      : null,
    artisan: product.artisan
      ? {
          id: product.artisan.id,
          name: product.artisan.name,
          location: product.artisan.location,
          photoUrl: product.artisan.photoUrl,
        }
      : null,
    stock: product.stock,
    featured: product.featured,
    published: product.published,
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    createdBy: product.createdBy,
    lastUpdatedBy: product.lastUpdatedBy,
  };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await ensureLegacyProductsMigrated();
  const products = await prisma.product.findMany({
    where: { featured: true, published: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      category: true,
      artisan: true,
    },
  });
  return products.map(toProductPayload);
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureLegacyProductsMigrated();
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      artisan: true,
    },
  });
  return products.map(toProductPayload);
}

type ProductFilters = {
  search?: string;
  category?: string;
  artisan?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "oldest";
};

export async function getFilteredProducts(filters: ProductFilters = {}): Promise<Product[]> {
  await ensureLegacyProductsMigrated();
  
  const where: Prisma.ProductWhereInput = {
    published: true,
  };

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    // For MongoDB, we'll filter in memory after fetching
    // This is acceptable for small catalogs
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.artisan) {
    // For MongoDB, we'll filter in memory after fetching
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.priceCents = {};
    if (filters.minPrice !== undefined) {
      where.priceCents.gte = filters.minPrice * 100;
    }
    if (filters.maxPrice !== undefined) {
      where.priceCents.lte = filters.maxPrice * 100;
    }
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price-asc":
        orderBy = { priceCents: "asc" };
        break;
      case "price-desc":
        orderBy = { priceCents: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
    }
  }

  let products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      artisan: true,
    },
  });

  // Apply search and artisan filters in memory (MongoDB/Prisma limitation)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower)) ||
        p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  if (filters.artisan) {
    const artisanLower = filters.artisan.toLowerCase();
    products = products.filter(
      (p) => p.artisan && p.artisan.name.toLowerCase().includes(artisanLower)
    );
  }

  return products.map(toProductPayload);
}

export async function getAllCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  await ensureLegacyProductsMigrated();
  const categories = await prisma.productCategory.findMany({
    orderBy: { name: "asc" },
  });
  return categories.map((cat) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
}

export async function getAllArtisans(): Promise<Array<{ id: string; name: string }>> {
  await ensureLegacyProductsMigrated();
  const artisans = await prisma.artisan.findMany({
    orderBy: { name: "asc" },
  });
  return artisans.map((artisan) => ({ id: artisan.id, name: artisan.name }));
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  artisanId: string | null,
  limit: number = 4
): Promise<Product[]> {
  await ensureLegacyProductsMigrated();
  
  const where: Prisma.ProductWhereInput = {
    published: true,
    id: { not: productId },
  };

  // Prioritize same category, then same artisan
  if (categoryId) {
    where.categoryId = categoryId;
  } else if (artisanId) {
    where.artisanId = artisanId;
  }

  const products = await prisma.product.findMany({
    where,
    take: limit,
    include: {
      category: true,
      artisan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // If we don't have enough products, fill with any other products
  if (products.length < limit) {
    const additionalProducts = await prisma.product.findMany({
      where: {
        published: true,
        id: { not: productId, notIn: products.map((p) => p.id) },
      },
      take: limit - products.length,
      include: {
        category: true,
        artisan: true,
      },
      orderBy: { createdAt: "desc" },
    });
    products.push(...additionalProducts);
  }

  return products.map(toProductPayload);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  await ensureLegacyProductsMigrated();
  
  if (!slug) {
    notFound();
  }

  // Use findFirst instead of findUnique when filtering by published
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      category: true,
      artisan: true,
    },
  });

  if (!product) {
    notFound();
  }

  return toProductPayload(product);
}

