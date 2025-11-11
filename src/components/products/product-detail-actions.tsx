"use client";

import { useState } from "react";

import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";

type Props = {
  product: Product;
};

export function ProductDetailActions({ product }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((prev) => Math.min(prev + 1, product.stock));
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="space-y-4 rounded-2xl border border-[#f6b2c5]/70 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-[#8a2040]">{formatCurrencyFromCents(product.priceCents)}</span>
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#b03d5e]">
          {product.stock > 10 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of stock"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-[#8a2040]/40">
          <button
            type="button"
            onClick={decrement}
            className="h-10 w-10 rounded-l-full text-lg font-semibold text-[#8a2040] transition hover:bg-[#ffe1ef] hover:text-[#6f1731]"
            aria-label="Decrease quantity"
          >
            –
          </button>
          <span className="min-w-[3rem] text-center text-sm font-semibold text-[#40111f]">{quantity}</span>
          <button
            type="button"
            onClick={increment}
            className="h-10 w-10 rounded-r-full text-lg font-semibold text-[#8a2040] transition hover:bg-[#ffe1ef] hover:text-[#6f1731]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => addItem(product, quantity)}
          disabled={product.stock === 0}
          className="flex-1 rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731] disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

