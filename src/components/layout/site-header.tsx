import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { AuthActions } from "@/components/layout/site-header/auth-actions";
import { CartButton } from "@/components/layout/site-header/cart-button";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-[#f6b2c5] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[#8a2040]">
          Janakpur Art & Craft
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/" className="transition hover:text-[#8a2040]">
            Home
          </Link>
          <Link href="/products" className="transition hover:text-[#8a2040]">
            Products
          </Link>
          <Link href="/checkout" className="transition hover:text-[#8a2040]">
            Checkout
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <CartButton />
          <AuthActions session={session} />
        </div>
      </div>
    </header>
  );
}

