"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/providers/cart-provider";

export function CartButton() {
  const { totalQuantity } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show 0 on server to avoid hydration mismatch
  const displayQuantity = mounted ? totalQuantity : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-full border border-[#8a2040]/40 px-4 py-2 text-sm font-medium text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
    >
      <span>Cart</span>
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#8a2040] px-2 text-xs font-semibold text-white shadow shadow-[#8a2040]/40">
        {displayQuantity}
      </span>
    </Link>
  );
}

