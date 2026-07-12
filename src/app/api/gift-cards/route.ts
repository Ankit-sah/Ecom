import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/gift-cards
 * Get user's gift cards
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const giftCards = await prisma.giftCard.findMany({
      where: {
        OR: [
          { purchasedById: session.user.id },
          { recipientEmail: session.user.email },
        ],
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(giftCards);
  } catch (error) {
    console.error("Failed to fetch gift cards:", error);
    return NextResponse.json({ error: "Failed to fetch gift cards." }, { status: 500 });
  }
}

/**
 * POST /api/gift-cards
 * Create/purchase a gift card
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amountCents, recipientEmail, recipientName, message } = body;

    if (!amountCents || amountCents < 1000) {
      return NextResponse.json({ error: "Minimum gift card amount is $10.00." }, { status: 400 });
    }

    // Generate unique code
    const code = `GC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amountCents,
        balanceCents: amountCents,
        purchasedById: session.user.id,
        recipientEmail: recipientEmail || null,
        recipientName: recipientName || null,
        message: message || null,
        status: "ACTIVE",
      },
    });

    // TODO: Create Stripe payment for gift card purchase
    // For now, return the gift card (in production, you'd process payment first)

    return NextResponse.json(giftCard, { status: 201 });
  } catch (error) {
    console.error("Failed to create gift card:", error);
    return NextResponse.json({ error: "Failed to create gift card." }, { status: 500 });
  }
}


