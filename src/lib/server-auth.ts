import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export const getCurrentSession = cache(async () => {
  return getServerSession(authOptions);
});

type AdminRole = "ADMIN" | "STAFF" | "ARTISAN_MANAGER";

export async function requireRole(allowedRoles: AdminRole[]) {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const role = session.user.role ?? "CUSTOMER";
  if (!allowedRoles.includes(role as AdminRole)) {
    redirect("/auth/sign-in?error=unauthorized");
  }
  return session;
}

