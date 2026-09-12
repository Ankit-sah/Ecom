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
    <div className="grid h-full overflow-hidden border border-[#ddcfbb] bg-[#fffdfa] shadow-[0_16px_40px_rgba(58,42,24,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(58,42,24,0.1)] sm:grid-cols-[0.92fr_1.08fr]">
      <Link
        href={`/products/${product.slug}`}
        className="relative block min-h-[260px] overflow-hidden bg-[#efe5d5] sm:min-h-full"
        aria-label={`View details for ${product.name}`}
      >
        {product.images.length > 0 ? (
          <OptimizedImage
            src={product.images[0]}
            alt={`${product.name}${product.category ? ` - ${product.category.name}` : ""}${product.artisan ? ` by ${product.artisan.name}` : ""}`}
            fill
            context="card"
            className="object-cover transition duration-500 hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#efe5d5] text-sm font-medium text-[#777064]" aria-label="No image available">
            No image
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="text-[11px] leading-5 text-[#70695f]">
          {product.category ? <div>{product.category.name}</div> : null}
          {product.artisan ? <div className="font-medium text-[#3f4a45]">{product.artisan.name}</div> : null}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="font-editorial mt-3 line-clamp-2 text-2xl leading-tight text-[#1b1f1d] transition hover:text-[#b9472f]"
        >
          {product.name}
        </Link>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#68645c]">{product.description}</p>

        {product.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-[#efe7db] px-2 py-1 text-[10px] font-medium text-[#696158]">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-editorial text-2xl font-semibold text-[#191d1b]">{formatCurrencyFromCents(product.priceCents)}</div>
              {product.stock === 0 ? (
                <span className="text-xs font-semibold text-red-700">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-xs font-semibold text-[#a75a20]">Only {product.stock} left</span>
              ) : (
                <span className="text-xs font-semibold text-[#1d7a45]">In Stock</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => addItem(product)}
              disabled={product.stock === 0}
              className="shrink-0 bg-[#b9472f] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#923622] focus:outline-none focus:ring-2 focus:ring-[#b9472f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#b9b1a5]"
              aria-label={`Add ${product.name} to cart`}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
