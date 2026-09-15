import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

type Policy = { limit: number; windowMs: number };

function clientKey(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

/** A shared, database-backed limit suitable for serverless instances. */
export async function isRateLimited(request: Request, scope: string, policy: Policy) {
  const key = `${scope}:${clientKey(request)}`;
  const now = new Date();
  const current = await prisma.rateLimitEntry.findUnique({ where: { key } });
  if (!current || current.resetAt <= now) {
    await prisma.rateLimitEntry.upsert({ where: { key }, create: { key, count: 1, resetAt: new Date(now.getTime() + policy.windowMs) }, update: { count: 1, resetAt: new Date(now.getTime() + policy.windowMs) } });
    return { limited: false, retryAfter: 0 };
  }
  const entry = await prisma.rateLimitEntry.update({ where: { key }, data: { count: { increment: 1 } } });
  return { limited: entry.count > policy.limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt.getTime() - now.getTime()) / 1000)) };
}
