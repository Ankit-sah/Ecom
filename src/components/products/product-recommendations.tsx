"use client";

import Link from "next/link";

import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";
import { OptimizedImage } from "@/components/products/optimized-image";
import { WishlistButton } from "@/components/products/wishlist-button";

type ProductRecommendationsProps = {
  products: Product[];
  title?: string;
};

export function ProductRecommendations({
  products,
  title = "You may also like",
}: ProductRecommendationsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden rounded-2xl border border-orange-200 bg-white/85 transition hover:shadow-lg"
          >
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden">
                {product.images[0] ? (
                  <OptimizedImage
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-400">
                    No image
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="line-clamp-2 font-semibold text-gray-800 transition hover:text-orange-500">
                    {product.name}
                  </h3>
                </Link>
                <WishlistButton productId={product.id} variant="icon" />
              </div>

              {product.category && (
                <p className="mb-1 text-xs text-neutral-500">{product.category.name}</p>
              )}

              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-orange-500">
                  {formatCurrencyFromCents(product.priceCents)}
                </span>
                {product.stock === 0 ? (
                  <span className="text-xs font-semibold text-red-600">Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="text-xs font-semibold text-orange-600">
                    Only {product.stock} left
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500">In Stock</span>
                )}
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="block w-full rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                View Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


