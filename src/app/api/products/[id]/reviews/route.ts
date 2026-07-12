import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/[id]/reviews
 * Get reviews for a product
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const reviews = await prisma.productReview.findMany({
      where: {
        productId: id,
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

/**
 * POST /api/products/[id]/reviews
 * Create a new review (requires authentication)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { rating, title, comment, images } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
    }

    // Check if user has purchased this product (for verified purchase badge)
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "PAID",
        items: {
          some: {
            productId: id,
          },
        },
      },
    });

    const review = await prisma.productReview.create({
      data: {
        productId: id,
        userId: session.user.id,
        rating,
        title: title || null,
        comment: comment || null,
        images: images || [],
        verified: !!hasPurchased,
        status: "PENDING", // Requires admin approval
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: "Failed to create review." }, { status: 500 });
  }
}


