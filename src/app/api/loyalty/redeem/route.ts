import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/loyalty/redeem
 * Redeem loyalty points for discount
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { points } = body;

    if (!points || points < 100) {
      return NextResponse.json({ error: "Minimum 100 points required to redeem." }, { status: 400 });
    }

    const loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId: session.user.id },
    });

    if (!loyalty || loyalty.points < points) {
      return NextResponse.json({ error: "Insufficient points." }, { status: 400 });
    }

    // 100 points = $1 discount
    const discountCents = Math.floor(points / 100) * 100;

    await prisma.loyaltyPoints.update({
      where: { userId: session.user.id },
      data: {
        points: { decrement: discountCents },
      },
    });

    await prisma.loyaltyTransaction.create({
      data: {
        loyaltyId: loyalty.id,
        points: -discountCents,
        type: "REDEEMED",
        description: `Redeemed ${discountCents} points for $${(discountCents / 100).toFixed(2)} discount`,
      },
    });

    return NextResponse.json({
      success: true,
      discountCents,
      remainingPoints: loyalty.points - discountCents,
    });
  } catch (error) {
    console.error("Failed to redeem points:", error);
    return NextResponse.json({ error: "Failed to redeem points." }, { status: 500 });
  }
}


