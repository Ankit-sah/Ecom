import { NextResponse } from "next/server";

import { consumeAccountToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  if (!body.token) return NextResponse.json({ error: "Verification link is missing." }, { status: 400 });
  const userId = await consumeAccountToken(body.token, "EMAIL_VERIFICATION");
  if (!userId) return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  return NextResponse.json({ success: true });
}
