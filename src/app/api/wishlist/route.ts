import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function validProductId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ productIds: [] });
  const items = await prisma.wishlistItem.findMany({ where: { userId: session.user.id }, select: { productId: true } });
  return NextResponse.json({ productIds: items.map((item) => item.productId) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to save items." }, { status: 401 });
  try {
    const { productId } = await request.json();
    if (!validProductId(productId)) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    const product = await prisma.product.findFirst({ where: { id: productId, published: true }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Product is unavailable." }, { status: 404 });
    await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: session.user.id, productId } }, update: {}, create: { userId: session.user.id, productId } });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Unable to save this item." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to manage saved items." }, { status: 401 });
  const productId = new URL(request.url).searchParams.get("productId");
  if (!validProductId(productId)) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id, productId } });
  return NextResponse.json({ saved: false });
}
