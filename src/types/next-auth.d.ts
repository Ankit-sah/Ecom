import type { DefaultSession } from "next-auth";
import type { AdapterUser as NextAuthAdapterUser } from "next-auth/adapters";

type AppUserRole = "ADMIN" | "STAFF" | "ARTISAN_MANAGER" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role: AppUserRole;
      phone?: string | null;
    };
  }

  interface User {
    id: string;
    role: AppUserRole;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppUserRole;
    phone?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends NextAuthAdapterUser {
    role: AppUserRole;
    phone?: string | null;
  }
}

