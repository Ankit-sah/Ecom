"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Session } from "next-auth";
import Link from "next/link";
import { useState } from "react";

import { AuthActions } from "@/components/layout/site-header/auth-actions";
import { CartButton } from "@/components/layout/site-header/cart-button";

type MobileNavProps = {
  session: Session | null;
  isAdmin: boolean;
};

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

export function MobileNav({ session, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const links = isAdmin ? [...navItems, { href: "/admin", label: "Admin" }] : navItems;

  return (
    <div className="flex items-center gap-2 xl:hidden">
      <div className="hidden md:block xl:hidden">
        <CartButton variant="compact" showLabel={false} />
      </div>
      <button
        type="button"
        className="relative z-50 flex h-10 w-10 items-center justify-center border border-[#d6c5af] bg-[#fbf6ed] transition hover:border-[#b9472f]"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sr-only">Menu</span>
        <div className="relative h-4 w-5">
          <span className={`absolute left-0 block h-px w-5 bg-[#31554d] transition-all ${open ? "top-2 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-2 block h-px w-5 bg-[#31554d] transition-all ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute left-0 block h-px w-5 bg-[#31554d] transition-all ${open ? "top-2 -rotate-45" : "top-4"}`} />
        </div>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[#162d28]/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-x-4 top-[72px] z-50 border border-[#d6c5af] bg-[#fbf6ed] p-5 shadow-2xl sm:left-auto sm:right-6 sm:w-[360px]"
            >
              <nav className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm text-[#2e342f]">
                {links.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-[#e3d8c9] py-3 transition hover:text-[#b9472f]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#d6c5af] pt-4">
                <AuthActions session={session} variant="minimal" />
                <CartButton variant="compact" />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
