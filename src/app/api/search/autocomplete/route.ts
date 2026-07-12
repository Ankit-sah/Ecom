import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * GET /api/search/autocomplete
 * Get search suggestions based on query
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Search products
    const products = await prisma.product.findMany({
      where: {
        published: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
      },
      take: 5,
    });

    // Search categories
    const categories = await prisma.productCategory.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 3,
    });

    // Search artisans
    const artisans = await prisma.artisan.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
      },
      take: 3,
    });

    return NextResponse.json({
      suggestions: {
        products: products.map((p) => ({
          type: "product",
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.images[0],
        })),
        categories: categories.map((c) => ({
          type: "category",
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
        artisans: artisans.map((a) => ({
          type: "artisan",
          id: a.id,
          name: a.name,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch search suggestions:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions." }, { status: 500 });
  }
}


