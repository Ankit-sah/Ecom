import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * POST /api/gift-cards/validate
 * Validate gift card code and get balance
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Gift card code is required." }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!giftCard) {
      return NextResponse.json({ error: "Invalid gift card code." }, { status: 404 });
    }

    if (giftCard.status !== "ACTIVE") {
      return NextResponse.json({ error: "This gift card is no longer active." }, { status: 400 });
    }

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return NextResponse.json({ error: "This gift card has expired." }, { status: 400 });
    }

    if (giftCard.balanceCents <= 0) {
      return NextResponse.json({ error: "This gift card has no remaining balance." }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      balanceCents: giftCard.balanceCents,
      amountCents: giftCard.amountCents,
    });
  } catch (error) {
    console.error("Failed to validate gift card:", error);
    return NextResponse.json({ error: "Failed to validate gift card." }, { status: 500 });
  }
}


