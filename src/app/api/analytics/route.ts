import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedEvents = new Set(["page_view", "client_error", "add_to_cart", "checkout_started", "payment_started", "payment_succeeded"]);

export async function POST(request: Request) {
  if (process.env.ANALYTICS_ENABLED !== "true") return new NextResponse(null, { status: 204 });
  const body = (await request.json().catch(() => ({}))) as { event?: string; path?: string; productId?: string };
  if (!body.event || !allowedEvents.has(body.event)) return new NextResponse(null, { status: 204 });
  await prisma.analyticsEvent.create({ data: { event: body.event, path: body.path?.slice(0, 200), productId: body.productId?.slice(0, 100) } }).catch((error) => console.error("Analytics write failed", error));
  return new NextResponse(null, { status: 204 });
}
