"use client";

import Link from "next/link";

import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";
import { OptimizedImage } from "@/components/products/optimized-image";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddcfbb] bg-[#fffdf9] shadow-[0_4px_18px_rgba(36,43,37,.06)] transition hover:-translate-y-1 hover:border-[#b9472f]/45 hover:shadow-[0_14px_34px_rgba(36,43,37,.12)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[1.06] overflow-hidden bg-[#f5eadb]"
        aria-label={`View details for ${product.name}`}
      >
        {product.images.length > 0 ? (
          <OptimizedImage
            src={product.images[0]}
            alt={`${product.name}${product.category ? ` - ${product.category.name}` : ""}${product.artisan ? ` by ${product.artisan.name}` : ""}`}
            fill
            context="card"
            className="object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 text-sm font-medium text-neutral-500" aria-label="No image available">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <span className="inline-flex items-center rounded-full bg-[#f5eadb] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b9472f]">
                {product.category.name}
              </span>
            ) : null}
            {product.artisan ? (
              <span className="inline-flex items-center rounded-full border border-[#ddcfbb] px-3 py-1 text-[10px] font-semibold text-[#31554d]">
                {product.artisan.name}
              </span>
            ) : null}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-[#242b25] transition hover:text-[#b9472f]"
          >
            {product.name}
          </Link>
          <p className="line-clamp-2 text-xs leading-5 text-neutral-600 sm:text-sm">{product.description}</p>
          {product.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-[#fbf6ed] px-2.5 py-1 text-[10px] font-medium text-[#6d5b48]">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-semibold text-[#242b25]">{formatCurrencyFromCents(product.priceCents)}</span>
            {product.stock === 0 ? (
              <span className="text-xs font-semibold text-red-600">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-xs font-semibold text-orange-600">Only {product.stock} left</span>
            ) : (
              <span className="text-xs text-neutral-500">In Stock</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          className="w-full rounded-xl bg-[#b9472f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#923622] focus:outline-none focus:ring-2 focus:ring-[#b9472f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            aria-label={`Add ${product.name} to cart`}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
