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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">My Account</p>
          <h1 className="text-4xl font-semibold text-gray-800">Welcome back, {session.user.name || "Customer"}</h1>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/account/orders"
          className="group rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm transition hover:shadow-lg hover:border-orange-500/50"
        >
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-orange-500">Order History</h2>
            <p className="text-sm text-neutral-600">
              View your past orders, track shipments, and manage returns.
            </p>
            <span className="inline-block text-sm font-semibold text-orange-500 group-hover:underline">
              View Orders →
            </span>
          </div>
        </Link>

        <div className="rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-orange-500">Name:</span>{" "}
                <span className="text-neutral-700">{session.user.name || "Not provided"}</span>
              </div>
              <div>
                <span className="font-medium text-orange-500">Email:</span>{" "}
                <span className="text-neutral-700">{session.user.email}</span>
              </div>
              {session.user.phone && (
                <div>
                  <span className="font-medium text-orange-500">Phone:</span>{" "}
                  <span className="text-neutral-700">{session.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-orange-200/70 bg-white/85 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Quick Links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/products"
            className="text-sm text-neutral-700 hover:text-orange-500 hover:underline"
          >
            Continue Shopping →
          </Link>
          <Link
            href="/cart"
            className="text-sm text-neutral-700 hover:text-orange-500 hover:underline"
          >
            View Cart →
          </Link>
          <Link
            href="/contact"
            className="text-sm text-neutral-700 hover:text-orange-500 hover:underline"
          >
            Contact Support →
          </Link>
          <Link
            href="/faq"
            className="text-sm text-neutral-700 hover:text-orange-500 hover:underline"
          >
            FAQ →
          </Link>
        </div>
      </section>
    </div>
  );
}

