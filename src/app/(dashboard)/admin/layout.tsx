import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | Janakpur Art and Craft",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["ADMIN", "STAFF", "ARTISAN_MANAGER"]);
  const roleLabel = session.user?.role ?? "CUSTOMER";
  console.log("[admin] session role", roleLabel, "for user", session.user?.email ?? "unknown");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ec] via-[#fce1d2] to-[#ffd1e3]">
      <header className="border-b border-orange-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Janakpur Art and Craft · Admin</h1>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Role: {roleLabel}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm font-semibold text-orange-500">
            <Link href="/admin" className="hover:text-orange-600">
              Overview
            </Link>
            <Link href="/admin/products" className="hover:text-orange-600">
              Catalogue
            </Link>
            <Link href="/admin/orders" className="hover:text-orange-600">
              Orders
            </Link>
            <Link href="/admin/imports" className="hover:text-orange-600">
              Imports & Audits
            </Link>
            <Link href="/" className="rounded-full border border-orange-200/60 px-3 py-1 text-xs hover:border-orange-500">
              View Storefront
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

