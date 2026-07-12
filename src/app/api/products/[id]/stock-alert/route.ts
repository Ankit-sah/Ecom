import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/products/[id]/stock-alert
 * Subscribe to stock alerts for a product
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.stockAlert.findUnique({
      where: {
        productId_email: {
          productId: id,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Already subscribed to stock alerts for this product." });
    }

    const alert = await prisma.stockAlert.create({
      data: {
        productId: id,
        userId: session?.user?.id || null,
        email,
        notified: false,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Failed to create stock alert:", error);
    return NextResponse.json({ error: "Failed to create stock alert." }, { status: 500 });
  }
}


