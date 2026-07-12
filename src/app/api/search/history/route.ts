import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/search/history
 * Get user's search history
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Generate session ID for guests
  const sessionId = session?.user?.id || `guest-${Date.now()}`;

  try {
    const history = await prisma.searchHistory.findMany({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { sessionId },
      orderBy: { createdAt: "desc" },
      take: 10,
      distinct: ["query"],
    });

    return NextResponse.json(history.map((h) => h.query));
  } catch (error) {
    console.error("Failed to fetch search history:", error);
    return NextResponse.json({ error: "Failed to fetch search history." }, { status: 500 });
  }
}

/**
 * POST /api/search/history
 * Save search query to history
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  try {
    const body = await request.json();
    const { query, results } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short." }, { status: 400 });
    }

    // Generate session ID for guests
    const sessionId = session?.user?.id ? null : `guest-${Date.now()}`;

    await prisma.searchHistory.create({
      data: {
        userId: session?.user?.id || null,
        sessionId,
        query,
        results: results || 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save search history:", error);
    return NextResponse.json({ error: "Failed to save search history." }, { status: 500 });
  }
}


