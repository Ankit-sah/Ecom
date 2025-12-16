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
      ? "inline-flex items-center gap-1 rounded-full border border-text-bg-orange-500/30 px-3 py-1.5 text-xs font-semibold text-text-bg-orange-500 transition hover:border-text-bg-orange-500 hover:text-text-orange-600"
      : "relative inline-flex items-center gap-2 rounded-full border border-text-bg-orange-500/40 px-4 py-2 text-sm font-medium text-text-bg-orange-500 transition hover:border-text-bg-orange-500 hover:text-text-orange-600";

  const badgeClasses =
    variant === "compact"
      ? "flex h-5 min-w-5 items-center justify-center rounded-full bg-text-bg-orange-500 px-1.5 text-[11px] font-semibold text-white shadow shadow-text-bg-orange-500/40"
      : "flex h-6 min-w-6 items-center justify-center rounded-full bg-text-bg-orange-500 px-2 text-xs font-semibold text-white shadow shadow-text-bg-orange-500/40";

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

