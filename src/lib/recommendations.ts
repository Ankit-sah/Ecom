import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

/**
 * Get product recommendations based on:
 * - Same category
 * - Same artisan
 * - Similar price range
 * - Popular products
 */
export async function getProductRecommendations(
  productId: string,
  limit: number = 4
): Promise<Product[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      artisan: true,
    },
  });

  if (!product) {
    return [];
  }

  // Get products from same category
  const categoryProducts = product.categoryId
    ? await prisma.product.findMany({
        where: {
          id: { not: productId },
          categoryId: product.categoryId,
          published: true,
          stock: { gt: 0 },
        },
        include: {
          category: true,
          artisan: true,
        },
        take: limit,
        orderBy: { featured: "desc" },
      })
    : [];

  // Get products from same artisan
  const artisanProducts = product.artisanId
    ? await prisma.product.findMany({
        where: {
          id: { not: productId },
          artisanId: product.artisanId,
          published: true,
          stock: { gt: 0 },
        },
        include: {
          category: true,
          artisan: true,
        },
        take: limit,
      })
    : [];

  // Get featured products
  const featuredProducts = await prisma.product.findMany({
    where: {
      id: { not: productId },
      featured: true,
      published: true,
      stock: { gt: 0 },
    },
    include: {
      category: true,
      artisan: true,
    },
    take: limit,
  });

  // Combine and deduplicate
  const allProducts = [
    ...categoryProducts,
    ...artisanProducts,
    ...featuredProducts,
  ];

  const uniqueProducts = Array.from(
    new Map(allProducts.map((p) => [p.id, p])).values()
  );

  // Convert to Product type format
  return uniqueProducts.slice(0, limit).map((product) => ({
    ...product,
    details: product.details as Record<string, unknown> | null,
    publishedAt: product.publishedAt?.toISOString() || null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

/**
 * Get "Frequently Bought Together" recommendations
 * Based on products that appear together in orders
 */
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit: number = 3
): Promise<Product[]> {
  // Find orders that contain this product
  const ordersWithProduct = await prisma.order.findMany({
    where: {
      status: "PAID",
      items: {
        some: {
          productId,
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    take: 50, // Sample recent orders
  });

  // Count how often other products appear with this one
  const productCounts = new Map<string, number>();

  for (const order of ordersWithProduct) {
    for (const item of order.items) {
      if (item.productId !== productId) {
        productCounts.set(
          item.productId,
          (productCounts.get(item.productId) || 0) + 1
        );
      }
    }
  }

  // Get top products
  const topProductIds = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topProductIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: topProductIds },
      published: true,
      stock: { gt: 0 },
    },
    include: {
      category: true,
      artisan: true,
    },
  });

  // Sort by frequency and convert to Product type format
  return products
    .sort(
      (a, b) =>
        (productCounts.get(b.id) || 0) - (productCounts.get(a.id) || 0)
    )
    .map((product) => ({
      ...product,
      details: product.details as Record<string, unknown> | null,
      publishedAt: product.publishedAt?.toISOString() || null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
}


