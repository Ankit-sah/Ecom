import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { toProductPayload } from "@/lib/product-service";
import { requireRole } from "@/lib/server-auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      artisan: true,
    },
  });

  return NextResponse.json({
    products: products.map(toProductPayload),
  });
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "STAFF"]);
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      sku?: string;
      description?: string | null;
      priceCents?: number;
      images?: string[];
      tags?: string[];
      stock?: number;
      featured?: boolean;
      published?: boolean;
      category?: { id?: string; slug?: string; name?: string };
      artisan?: { id?: string; name?: string; location?: string; bio?: string };
    };

    if (!body.name || typeof body.priceCents !== "number" || !body.sku) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const baseSlug = body.slug?.length ? slugify(body.slug) : slugify(body.name);

    let categoryId: string | undefined;
    if (body.category?.id) {
      categoryId = body.category.id;
    } else if (body.category?.name) {
      const categorySlug = body.category.slug?.length ? slugify(body.category.slug) : slugify(body.category.name);
      const category = await prisma.productCategory.upsert({
        where: { slug: categorySlug },
        update: { name: body.category.name },
        create: { name: body.category.name, slug: categorySlug },
      });
      categoryId = category.id;
    }

    let artisanId: string | undefined;
    if (body.artisan?.id) {
      artisanId = body.artisan.id;
    } else if (body.artisan?.name) {
      const artisan = await prisma.artisan.upsert({
        where: { name: body.artisan.name },
        update: {
          location: body.artisan.location,
          bio: body.artisan.bio,
        },
        create: {
          name: body.artisan.name,
          location: body.artisan.location,
          bio: body.artisan.bio,
        },
      });
      artisanId = artisan.id;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: baseSlug,
        sku: body.sku,
        description: body.description,
        priceCents: body.priceCents,
        images: body.images ?? [],
        tags: body.tags ?? [],
        stock: body.stock ?? 0,
        featured: body.featured ?? false,
        published: body.published ?? false,
        publishedAt: body.published ? new Date() : null,
        categoryId,
        artisanId,
        createdBy: session.user?.email ?? null,
        lastUpdatedBy: session.user?.email ?? null,
      },
      include: {
        category: true,
        artisan: true,
      },
    });

    return NextResponse.json({ product: toProductPayload(product) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}

