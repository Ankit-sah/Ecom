import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/loyalty/points
 * Get user's loyalty points
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    let loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!loyalty) {
      // Create loyalty account if it doesn't exist
      loyalty = await prisma.loyaltyPoints.create({
        data: {
          userId: session.user.id,
          points: 0,
          tier: "BRONZE",
          lifetimePoints: 0,
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    }

    return NextResponse.json(loyalty);
  } catch (error) {
    console.error("Failed to fetch loyalty points:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty points." }, { status: 500 });
  }
}


