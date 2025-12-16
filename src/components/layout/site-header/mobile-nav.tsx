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
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/checkout", label: "Checkout" },
];

export function MobileNav({ session, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const links = isAdmin ? [...navItems, { href: "/admin", label: "Admin" }] : navItems;

  return (
    <div className="flex items-center gap-2 md:hidden">
      <CartButton variant="compact" showLabel={false} />
      <AuthActions session={session} variant="minimal" />
      <button
        type="button"
        className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-orange-200/70 bg-white/90 shadow-sm transition hover:border-orange-500"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sr-only">Menu</span>
        <div className="relative h-5 w-5">
          <span
            className={`absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-orange-500 transition-all duration-300 ${
              open ? "top-2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-2 block h-0.5 w-5 rounded-full bg-orange-500 transition-all duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-4 block h-0.5 w-5 rounded-full bg-orange-500 transition-all duration-300 ${
              open ? "top-2 -rotate-45" : "top-4"
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none fixed inset-x-0 top-[72px] z-50 px-4 sm:top-[80px]"
            >
              <div className="pointer-events-auto mx-auto max-w-sm rounded-3xl border border-orange-200/70 bg-white p-6 shadow-2xl backdrop-blur">
                <nav className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
                  {links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl border border-transparent px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50 active:bg-orange-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-4 flex flex-col gap-2 border-t border-orange-100 pt-4">
                  <CartButton variant="compact" />
                  <AuthActions session={session} variant="minimal" />
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

