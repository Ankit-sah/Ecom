"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#f6b2c5]/60 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-[#8a2040]/50">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-t-2xl">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 text-sm font-medium text-neutral-500">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <span className="inline-flex items-center rounded-full bg-[#ffe1ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b03d5e]">
                {product.category.name}
              </span>
            ) : null}
            {product.artisan ? (
              <span className="inline-flex items-center rounded-full border border-[#f6b2c5]/70 px-3 py-1 text-[11px] font-semibold text-[#8a2040]">
                {product.artisan.name}
              </span>
            ) : null}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 text-lg font-semibold text-[#40111f] transition hover:text-[#8a2040]"
          >
            {product.name}
          </Link>
          <p className="text-sm text-neutral-600 line-clamp-2">{product.description}</p>
          {product.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#f6b2c5]/60 px-3 py-1 text-[11px] font-medium text-[#b03d5e]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold text-[#8a2040]">
            {formatCurrencyFromCents(product.priceCents)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="rounded-full bg-[#8a2040] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

