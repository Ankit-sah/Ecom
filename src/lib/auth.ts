import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import OktaProvider from "next-auth/providers/okta";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/passwords";

// UserRole enum type - matches Prisma schema
type UserRole = "ADMIN" | "STAFF" | "ARTISAN_MANAGER" | "CUSTOMER";

const adminEmailEnv = process.env.ADMIN_EMAILS ?? "";
const adminEmails = adminEmailEnv
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);
const oktaEnabled = Boolean(process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET && process.env.OKTA_ISSUER);

function isValidObjectId(value: string | undefined | null) {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

async function ensureAdminRole(userId: string | undefined | null, email?: string | null) {
  const normalizedEmail = email?.toLowerCase();
  if (!normalizedEmail || !adminEmails.includes(normalizedEmail)) {
    return;
  }

  if (isValidObjectId(userId)) {
    try {
      await prisma.user.update({
        where: { id: userId as string },
        data: { role: "ADMIN" },
      });
      return;
    } catch (error) {
      console.warn("Failed to promote admin role via userId, falling back to email lookup:", error);
    }
  }

  await prisma.user.updateMany({
    where: { email: normalizedEmail },
    data: { role: "ADMIN" },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await verifyPassword(password, user.passwordHash))) return null;

        await ensureAdminRole(user.id, user.email);
        const role = adminEmails.includes(email) ? "ADMIN" : user.role;
        return { id: user.id, name: user.name, email: user.email, role, phone: user.phone };
      },
    }),
    ...(oktaEnabled
      ? [OktaProvider({ clientId: process.env.OKTA_CLIENT_ID!, clientSecret: process.env.OKTA_CLIENT_SECRET!, issuer: process.env.OKTA_ISSUER! })]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = (token?.sub as string) ?? session.user.id;
      session.user.role = (token?.role as UserRole) ?? session.user.role ?? "CUSTOMER";
      session.user.phone = (token?.phone as string | null) ?? session.user.phone ?? null;

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
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
