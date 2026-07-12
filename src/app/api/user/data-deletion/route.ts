import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/user/data-deletion
 * Delete all user data (GDPR compliance)
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // Delete user data (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true, message: "All user data has been deleted." });
  } catch (error) {
    console.error("Failed to delete user data:", error);
    return NextResponse.json({ error: "Failed to delete user data." }, { status: 500 });
  }
}


