"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useCart } from "@/providers/cart-provider";
import { formatCurrencyFromCents } from "@/utils/format";
import { OptimizedImage } from "@/components/products/optimized-image";
import { WishlistButton } from "@/components/products/wishlist-button";

type WishlistItem = {
  id: string;
  productId: string;
  createdAt: Date | string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    images: string[];
    stock: number;
    category: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
    } | null;
    artisan: {
      id: string;
      name: string;
      location?: string | null;
      photoUrl?: string | null;
    } | null;
  };
};

type WishlistClientProps = {
  initialWishlist: WishlistItem[];
};

export function WishlistClient({ initialWishlist }: WishlistClientProps) {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const { addItem } = useCart();

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setWishlist(wishlist.filter((item) => item.productId !== productId));
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-white/75 p-16 text-center">
        <svg
          className="mb-4 h-16 w-16 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">Your wishlist is empty</h2>
        <p className="mb-6 text-sm text-neutral-600">
          Start adding products you love to your wishlist!
        </p>
        <Link
          href="/products"
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-2xl border border-orange-200 bg-white/85 transition hover:shadow-lg"
        >
          <Link href={`/products/${item.product.slug}`} className="block">
            <div className="relative aspect-square overflow-hidden">
              {item.product.images[0] ? (
                <OptimizedImage
                  src={item.product.images[0]}
                  alt={item.product.name}
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
              <Link href={`/products/${item.product.slug}`}>
                <h3 className="line-clamp-2 font-semibold text-gray-800 transition hover:text-orange-500">
                  {item.product.name}
                </h3>
              </Link>
              <WishlistButton productId={item.product.id} variant="icon" />
            </div>

            {item.product.category && (
              <p className="mb-1 text-xs text-neutral-500">{item.product.category.name}</p>
            )}

            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-orange-500">
                {formatCurrencyFromCents(item.product.priceCents)}
              </span>
              {item.product.stock === 0 ? (
                <span className="text-xs font-semibold text-red-600">Out of Stock</span>
              ) : item.product.stock <= 5 ? (
                <span className="text-xs font-semibold text-orange-600">
                  Only {item.product.stock} left
                </span>
              ) : (
                <span className="text-xs text-neutral-500">In Stock</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  // Construct product with all required fields
                  const product: any = {
                    ...item.product,
                    sku: item.product.id,
                    description: null,
                    tags: [],
                    details: null,
                    featured: false,
                    published: true,
                    publishedAt: null,
                    category: item.product.category ? {
                      id: item.product.category.id || "",
                      name: item.product.category.name,
                      slug: item.product.category.slug || "",
                    } : null,
                    artisan: item.product.artisan ? {
                      id: item.product.artisan.id || "",
                      name: item.product.artisan.name,
                    } : null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: null,
                    lastUpdatedBy: null,
                  };
                  addItem(product, 1);
                }}
                disabled={item.product.stock === 0}
                className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleRemove(item.product.id)}
                className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


