"use client";

import Link from "next/link";

import { useCart } from "@/providers/cart-provider";

type CartButtonProps = {
  variant?: "default" | "compact";
  showLabel?: boolean;
};

export function CartButton({ variant = "default", showLabel = true }: CartButtonProps) {
  const { totalQuantity } = useCart();

  const baseClasses =
    variant === "compact"
      ? "inline-flex items-center gap-1 rounded-full border border-[#8a2040]/30 px-3 py-1.5 text-xs font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
      : "relative inline-flex items-center gap-2 rounded-full border border-[#8a2040]/40 px-4 py-2 text-sm font-medium text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]";

  const badgeClasses =
    variant === "compact"
      ? "flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8a2040] px-1.5 text-[11px] font-semibold text-white shadow shadow-[#8a2040]/40"
      : "flex h-6 min-w-6 items-center justify-center rounded-full bg-[#8a2040] px-2 text-xs font-semibold text-white shadow shadow-[#8a2040]/40";

  return (
    <Link 
      href="/cart" 
      className={baseClasses}
      aria-label={`Shopping cart with ${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`}
    >
      {showLabel ? <span>Cart</span> : null}
      <span className={badgeClasses} aria-hidden="true">{totalQuantity}</span>
    </Link>
  );
}

