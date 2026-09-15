import { NextResponse } from "next/server";

import { consumeAccountToken } from "@/lib/account-tokens";
import { hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimit = await isRateLimited(request, "reset-password", { limit: 10, windowMs: 60 * 60 * 1000 });
  if (rateLimit.limited) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
  const body = (await request.json().catch(() => ({}))) as { token?: string; password?: string };
  if (!body.token || !body.password || body.password.length < 8 || body.password.length > 128) {
    return NextResponse.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
  }
  const userId = await consumeAccountToken(body.token, "PASSWORD_RESET");
  if (!userId) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(body.password) } });
  return NextResponse.json({ success: true });
}
