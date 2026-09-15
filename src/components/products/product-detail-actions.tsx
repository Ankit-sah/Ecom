"use client";

import { useState } from "react";

import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";
import { WishlistButton } from "@/components/products/wishlist-button";

type Props = {
  product: Product;
};

export function ProductDetailActions({ product }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((prev) => Math.min(prev + 1, product.stock));
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="space-y-4 rounded-2xl border border-[#ddcfbb] bg-[#fffdf9] p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <span className="font-serif text-2xl font-semibold text-[#242b25]">{formatCurrencyFromCents(product.priceCents)}</span>
        <div className="text-right">
          {isOutOfStock ? (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              Only {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              In Stock
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-[#ddcfbb] bg-white">
          <button
            type="button"
            onClick={decrement}
            disabled={isOutOfStock}
            className="h-11 w-10 rounded-l-xl text-lg font-semibold text-[#b9472f] transition hover:bg-[#fbf6ed] disabled:cursor-not-allowed disabled:text-neutral-400"
            aria-label="Decrease quantity"
          >
            –
          </button>
          <span className="min-w-[3rem] text-center text-sm font-semibold text-gray-800">{quantity}</span>
          <button
            type="button"
            onClick={increment}
            disabled={isOutOfStock || quantity >= product.stock}
            className="h-11 w-10 rounded-r-xl text-lg font-semibold text-[#b9472f] transition hover:bg-[#fbf6ed] disabled:cursor-not-allowed disabled:text-neutral-400"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <WishlistButton productId={product.id} />
        <button
          type="button"
          onClick={() => addItem(product, quantity)}
          disabled={isOutOfStock}
          className="flex-1 rounded-xl bg-[#b9472f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#923622] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
        >
          {isOutOfStock ? "Out of Stock" : "Add to cart"}
        </button>
      </div>
      {isLowStock && !isOutOfStock && (
        <p className="text-xs text-orange-600">
          ⚠️ Limited stock available. Order soon to secure your item.
        </p>
      )}
    </div>
  );
}
