import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/account");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">My Account</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Welcome back, {session.user.name || "Customer"}</h1>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/account/orders"
          className="group rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm transition hover:shadow-lg hover:border-[#8a2040]/50"
        >
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[#40111f] group-hover:text-[#8a2040]">Order History</h2>
            <p className="text-sm text-neutral-600">
              View your past orders, track shipments, and manage returns.
            </p>
            <span className="inline-block text-sm font-semibold text-[#8a2040] group-hover:underline">
              View Orders →
            </span>
          </div>
        </Link>

        <div className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[#40111f]">Account Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-[#8a2040]">Name:</span>{" "}
                <span className="text-neutral-700">{session.user.name || "Not provided"}</span>
              </div>
              <div>
                <span className="font-medium text-[#8a2040]">Email:</span>{" "}
                <span className="text-neutral-700">{session.user.email}</span>
              </div>
              {session.user.phone && (
                <div>
                  <span className="font-medium text-[#8a2040]">Phone:</span>{" "}
                  <span className="text-neutral-700">{session.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-[#40111f]">Quick Links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/products"
            className="text-sm text-neutral-700 hover:text-[#8a2040] hover:underline"
          >
            Continue Shopping →
          </Link>
          <Link
            href="/cart"
            className="text-sm text-neutral-700 hover:text-[#8a2040] hover:underline"
          >
            View Cart →
          </Link>
          <Link
            href="/contact"
            className="text-sm text-neutral-700 hover:text-[#8a2040] hover:underline"
          >
            Contact Support →
          </Link>
          <Link
            href="/faq"
            className="text-sm text-neutral-700 hover:text-[#8a2040] hover:underline"
          >
            FAQ →
          </Link>
        </div>
      </section>
    </div>
  );
}

