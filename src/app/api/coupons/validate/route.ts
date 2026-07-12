import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/coupons/validate
 * Validate and get coupon discount amount
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  try {
    const body = await request.json();
    const { code, totalCents } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json({ error: "This coupon is no longer active." }, { status: 400 });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }

    // Check minimum purchase
    if (coupon.minPurchase && totalCents < coupon.minPurchase) {
      return NextResponse.json({
        error: `Minimum purchase of ${(coupon.minPurchase / 100).toFixed(2)} required.`,
      }, { status: 400 });
    }

    // Calculate discount
    let discountCents = 0;
    if (coupon.type === "PERCENTAGE") {
      discountCents = Math.round((totalCents * coupon.value) / 100);
      if (coupon.maxDiscount) {
        discountCents = Math.min(discountCents, coupon.maxDiscount);
      }
    } else if (coupon.type === "FIXED") {
      discountCents = coupon.value;
    } else if (coupon.type === "FREE_SHIPPING") {
      // This will be handled in checkout
      discountCents = 0;
    }

    // Check user limit if authenticated
    if (session?.user?.id && coupon.userLimit) {
      const userRedemptions = await prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          userId: session.user.id,
        },
      });

      if (userRedemptions >= coupon.userLimit) {
        return NextResponse.json({
          error: "You have already used this coupon the maximum number of times.",
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        description: coupon.description,
      },
      discountCents,
      freeShipping: coupon.type === "FREE_SHIPPING",
    });
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return NextResponse.json({ error: "Failed to validate coupon." }, { status: 500 });
  }
}


