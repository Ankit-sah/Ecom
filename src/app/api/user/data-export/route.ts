import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/data-export
 * Export all user data (GDPR compliance)
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const [user, orders, reviews, wishlist, loyalty, referrals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
        },
      }),
      prisma.productReview.findMany({
        where: { userId: session.user.id },
        include: {
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.wishlist.findMany({
        where: { userId: session.user.id },
        include: {
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.loyaltyPoints.findUnique({
        where: { userId: session.user.id },
        include: {
          transactions: true,
        },
      }),
      prisma.referral.findMany({
        where: { referrerId: session.user.id },
      }),
    ]);

    const data = {
      user,
      orders,
      reviews,
      wishlist,
      loyalty,
      referrals,
      exportedAt: new Date().toISOString(),
    };

    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Failed to export user data:", error);
    return NextResponse.json({ error: "Failed to export user data." }, { status: 500 });
  }
}


