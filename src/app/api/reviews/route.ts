import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

const objectId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId");
  if (!objectId(productId)) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  const reviews = await prisma.productReview.findMany({ where: { productId, status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reviews: reviews.map((review) => ({ id: review.id, rating: review.rating, title: review.title, body: review.body, verifiedPurchase: review.verifiedPurchase, createdAt: review.createdAt, name: review.user.name || "Verified customer" })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  try {
    const limited = await isRateLimited(request, "reviews", { limit: 5, windowMs: 60 * 60 * 1000 });
    if (limited.limited) return NextResponse.json({ error: "Too many review attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  } catch { /* Review eligibility remains protected by order verification. */ }
  const body = ((await request.json().catch(() => ({}))) ?? {}) as { productId?: string; rating?: number; title?: string; body?: string };
  const productId = body.productId;
  const rating = body.rating;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const reviewBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!objectId(productId) || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5 || !title || !reviewBody || title.length > 100 || reviewBody.length > 1200) return NextResponse.json({ error: "Please provide a rating, a short title, and a review." }, { status: 400 });
  const purchased = await prisma.order.findFirst({ where: { userId: session.user.id, status: { in: ["PAID", "FULFILLED"] }, items: { some: { productId } } }, select: { id: true } });
  if (!purchased) return NextResponse.json({ error: "Only customers who purchased this piece can review it." }, { status: 403 });
  const review = await prisma.productReview.upsert({ where: { userId_productId: { userId: session.user.id, productId } }, update: { rating, title, body: reviewBody, verifiedPurchase: true, status: "PENDING", moderatedBy: null, moderatedAt: null }, create: { userId: session.user.id, productId, rating, title, body: reviewBody, verifiedPurchase: true, status: "PENDING", moderatedBy: null, moderatedAt: null }, include: { user: { select: { name: true } } } });
  return NextResponse.json({ review: { id: review.id, rating: review.rating, title: review.title, body: review.body, verifiedPurchase: review.verifiedPurchase, createdAt: review.createdAt, name: review.user.name || "Verified customer" } }, { status: 201 });
}
