import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    const requiredConfiguration = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
    const missingConfiguration = requiredConfiguration.filter((name) => !process.env[name]);
    if (missingConfiguration.length > 0) {
      return NextResponse.json({ status: "degraded", database: "ok", missingConfiguration }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ status: "ok", database: "ok", timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
