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
    <div className="flex h-full flex-col rounded-xl border border-orange-200/60 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/50 sm:rounded-2xl">
      <Link 
        href={`/products/${product.slug}`} 
        className="relative block aspect-square overflow-hidden rounded-t-2xl"
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
      <div className="flex flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-600">
                {product.category.name}
              </span>
            ) : null}
            {product.artisan ? (
              <span className="inline-flex items-center rounded-full border border-orange-200 px-3 py-1 text-[11px] font-semibold text-orange-500">
                {product.artisan.name}
              </span>
            ) : null}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 text-base font-semibold text-gray-800 transition hover:text-orange-500 sm:text-lg"
          >
            {product.name}
          </Link>
          <p className="text-xs text-neutral-600 line-clamp-2 sm:text-sm">{product.description}</p>
          {product.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-orange-200 px-3 py-1 text-[11px] font-medium text-orange-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-orange-500">
              {formatCurrencyFromCents(product.priceCents)}
            </span>
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
            className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            aria-label={`Add ${product.name} to cart`}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

