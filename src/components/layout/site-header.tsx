import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { AuthActions } from "@/components/layout/site-header/auth-actions";
import { CartButton } from "@/components/layout/site-header/cart-button";
import { MobileNav } from "@/components/layout/site-header/mobile-nav";

const navItems = [
  { href: "/products", label: "All Products" },
  { href: "/products?filter=featured", label: "Featured" },
  { href: "/products", label: "Categories" },
  { href: "/about", label: "Our Story" },
  { href: "/artisans", label: "Artisans" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/faq", label: "FAQ" },
];

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "STAFF" ||
    session?.user?.role === "ARTISAN_MANAGER";

  const links = isAdmin ? [...navItems, { href: "/admin", label: "Admin" }] : [...navItems];

  if (session?.user && !isAdmin) {
    links.push({ href: "/account", label: "Account" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#ddcfbb] bg-[#fbf6ed]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Janakpur Art and Craft - Home">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#cfae91] bg-[#f3e4d4] text-[#b9472f]" aria-hidden="true">
            <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20 32c0-7 0-14 0-21M20 16c-4-5-8-7-12-7 1 6 5 11 12 12M20 16c4-5 8-7 12-7-1 6-5 11-12 12M20 12c-2-5-1-8 0-11 3 3 4 7 0 11M20 24c-6 0-11 2-15 7 7 2 12 1 15-2M20 24c6 0 11 2 15 7-7 2-12 1-15-2" />
            </svg>
          </span>
          <span className="font-editorial truncate text-xl text-[#a13f2b] sm:text-2xl">Janakpur Art & Craft</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-[12px] font-medium text-[#2f342f] xl:flex" aria-label="Main navigation">
          {links.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="whitespace-nowrap transition hover:text-[#b9472f]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <AuthActions session={session} />
          <CartButton />
        </div>

        <MobileNav session={session} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
