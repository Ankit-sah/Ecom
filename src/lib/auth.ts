import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import OktaProvider from "next-auth/providers/okta";

import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const adminEmailEnv = process.env.ADMIN_EMAILS ?? "";
const adminEmails = adminEmailEnv
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

async function ensureAdminRole(userId: string, email?: string | null) {
  if (!email) {
    return;
  }
  const normalized = email.toLowerCase();
  if (!adminEmails.includes(normalized)) {
    return;
  }
  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "database",
  },
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID!,
      clientSecret: process.env.OKTA_CLIENT_SECRET!,
      issuer: process.env.OKTA_ISSUER!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user.role as UserRole) ?? "CUSTOMER";
        session.user.phone = user.phone;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user.role as UserRole) ?? "CUSTOMER";
        token.phone = user.phone ?? null;
      }
      return token;
    },
    async signIn({ user }) {
      if (user.id) {
        await ensureAdminRole(user.id, user.email);
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureAdminRole(user.id, user.email);
      }
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
};

