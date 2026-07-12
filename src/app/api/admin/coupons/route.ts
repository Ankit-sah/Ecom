import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/coupons
 * Create a new coupon (admin only)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      userLimit,
      validFrom,
      validUntil,
      active,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Code, type, and value are required." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        type,
        value,
        minPurchase: minPurchase || 0,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        userLimit: userLimit || 1,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        active: active !== false,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Failed to create coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon." }, { status: 500 });
  }
}

/**
 * GET /api/admin/coupons
 * Get all coupons (admin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons." }, { status: 500 });
  }
}


