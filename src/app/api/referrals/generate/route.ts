import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/referrals/generate
 * Generate a referral code for the current user
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // Check if user already has a referral code
    const existing = await prisma.referral.findFirst({
      where: {
        referrerId: session.user.id,
        status: { in: ["PENDING", "COMPLETED"] },
      },
    });

    if (existing) {
      return NextResponse.json({
        code: existing.code,
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/?ref=${existing.code}`,
      });
    }

    // Generate unique code
    const code = `REF${session.user.id.slice(-6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        code,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      code: referral.code,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/?ref=${referral.code}`,
    });
  } catch (error) {
    console.error("Failed to generate referral code:", error);
    return NextResponse.json({ error: "Failed to generate referral code." }, { status: 500 });
  }
}


