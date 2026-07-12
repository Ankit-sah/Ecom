import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/products/compare
 * Save product comparison
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "At least 1 product is required." }, { status: 400 });
    }

    if (productIds.length > 4) {
      return NextResponse.json({ error: "Maximum 4 products can be compared." }, { status: 400 });
    }

    // Generate session ID for guests
    const sessionId = session?.user?.id ? null : `guest-${Date.now()}`;

    // Find existing comparison
    const existing = await prisma.productComparison.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionId: sessionId || undefined },
    });

    const comparison = existing
      ? await prisma.productComparison.update({
          where: { id: existing.id },
          data: {
            products: productIds,
            updatedAt: new Date(),
          },
        })
      : await prisma.productComparison.create({
          data: {
            userId: session?.user?.id || null,
            sessionId,
            products: productIds,
          },
        });

    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Failed to save comparison:", error);
    return NextResponse.json({ error: "Failed to save comparison." }, { status: 500 });
  }
}

/**
 * GET /api/products/compare
 * Get current comparison
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Generate session ID for guests
  const sessionId = session?.user?.id ? null : `guest-${Date.now()}`;

  try {
    const comparison = await prisma.productComparison.findFirst({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionId },
      orderBy: { updatedAt: "desc" },
    });

    if (!comparison) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: comparison.products },
        published: true,
      },
      include: {
        category: true,
        artisan: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch comparison:", error);
    return NextResponse.json({ error: "Failed to fetch comparison." }, { status: 500 });
  }
}


