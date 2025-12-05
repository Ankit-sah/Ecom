import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: Array<{
        productId: string;
        quantity: number;
      }>;
    };

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Items array is required." }, { status: 400 });
    }

    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        published: true,
      },
    });

    const stockStatus = body.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return {
          productId: item.productId,
          available: false,
          error: "Product not found",
        };
      }

      if (!product.published) {
        return {
          productId: item.productId,
          name: product.name,
          available: false,
          error: "Product is no longer available",
        };
      }

      const available = product.stock >= item.quantity;
      return {
        productId: item.productId,
        name: product.name,
        available,
        requestedQuantity: item.quantity,
        availableStock: product.stock,
        error: available ? null : `Only ${product.stock} available`,
      };
    });

    const allAvailable = stockStatus.every((status) => status.available);

    return NextResponse.json({
      allAvailable,
      items: stockStatus,
    });
  } catch (error) {
    console.error("Failed to check stock:", error);
    return NextResponse.json({ error: "Failed to check stock availability." }, { status: 500 });
  }
}

