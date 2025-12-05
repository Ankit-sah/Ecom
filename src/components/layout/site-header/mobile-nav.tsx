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
        className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#f6b2c5]/70 bg-white/90 shadow-sm transition hover:border-[#8a2040]"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className={`block h-0.5 w-5 rounded-full bg-[#8a2040] transition-transform duration-300 ${
            open ? "translate-y-0.5 rotate-45" : "-translate-y-1"
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-[#8a2040] transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-[#8a2040] transition-transform duration-300 ${
            open ? "-translate-y-0.5 -rotate-45" : "translate-y-1"
          }`}
        />
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
              className="pointer-events-none fixed inset-x-0 top-[72px] z-50 px-4"
            >
              <div className="pointer-events-auto rounded-3xl border border-[#f6b2c5]/70 bg-white p-6 shadow-2xl backdrop-blur">
                <nav className="flex flex-col gap-3 text-sm font-semibold text-[#40111f]">
                  {links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl border border-transparent px-4 py-2 transition hover:border-[#f6b2c5]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-5 flex flex-col gap-3">
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

