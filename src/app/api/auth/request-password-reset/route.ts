import { NextResponse } from "next/server";

import { createAccountToken } from "@/lib/account-tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

const response = { success: true, message: "If an account exists for that email, a reset link has been sent." };

export async function POST(request: Request) {
  const rateLimit = await isRateLimited(request, "password-reset", { limit: 5, windowMs: 60 * 60 * 1000 });
  if (rateLimit.limited) return NextResponse.json(response, { headers: { "Retry-After": String(rateLimit.retryAfter) } });
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || email.length > 254) return NextResponse.json(response);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = await createAccountToken(user.id, "PASSWORD_RESET");
    await sendPasswordResetEmail(email, token);
  }
  return NextResponse.json(response);
}
