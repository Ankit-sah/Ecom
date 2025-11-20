import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { AuthActions } from "@/components/layout/site-header/auth-actions";
import { CartButton } from "@/components/layout/site-header/cart-button";
import { MobileNav } from "@/components/layout/site-header/mobile-nav";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/checkout", label: "Checkout" },
];

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "STAFF" ||
    session?.user?.role === "ARTISAN_MANAGER";

  const links = isAdmin ? [...navItems, { href: "/admin", label: "Admin" }] : navItems;

  return (
    <header className="sticky top-0 z-50 border-b border-[#f6b2c5] bg-white/85 shadow-sm backdrop-blur">
      <div className="relative mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#8a2040] sm:text-xl">
            Janakpur Art & Craft
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[#8a2040]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <CartButton />
            <AuthActions session={session} />
          </div>

          <MobileNav session={session} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}

