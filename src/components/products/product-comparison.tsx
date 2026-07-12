"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";
import { OptimizedImage } from "@/components/products/optimized-image";

type ProductComparisonProps = {
  product: Product;
  onRemove: (productId: string) => void;
};

export function ProductComparison({ product, onRemove }: ProductComparisonProps) {
  return (
    <div className="relative rounded-2xl border border-orange-200 bg-white/85 p-4">
      <button
        onClick={() => onRemove(product.id)}
        className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Remove from comparison"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg">
          {product.images[0] ? (
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-400">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-orange-500">{product.name}</h3>
        </Link>
        <p className="mt-2 text-lg font-semibold text-orange-500">
          {formatCurrencyFromCents(product.priceCents)}
        </p>
        {product.category && (
          <p className="mt-1 text-xs text-neutral-500">{product.category.name}</p>
        )}
        {product.artisan && (
          <p className="mt-1 text-xs text-neutral-500">By {product.artisan.name}</p>
        )}
        <p className="mt-2 text-xs text-neutral-600">
          Stock: {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
        </p>
      </div>
    </div>
  );
}

type ComparisonViewProps = {
  initialProducts: Product[];
};

export function ComparisonView({ initialProducts }: ComparisonViewProps) {
  const [products, setProducts] = useState(initialProducts);

  const handleRemove = async (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);

    if (updated.length >= 2) {
      await fetch("/api/products/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: updated.map((p) => p.id) }),
      });
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-white/75 p-12 text-center">
        <p className="text-neutral-600">No products to compare. Add products to compare them side by side.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Compare Products</h2>
        {products.length >= 2 && (
          <Link
            href="/products"
            className="text-sm font-semibold text-orange-500 hover:text-orange-600"
          >
            Add More →
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductComparison key={product.id} product={product} onRemove={handleRemove} />
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white/85">
        <table className="w-full">
          <thead className="border-b border-orange-200 bg-orange-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Feature</th>
              {products.map((product) => (
                <th key={product.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-800">
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-orange-200/50">
              <td className="px-4 py-3 text-sm font-medium text-gray-700">Price</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-center text-sm text-gray-800">
                  {formatCurrencyFromCents(product.priceCents)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-orange-200/50">
              <td className="px-4 py-3 text-sm font-medium text-gray-700">Category</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-center text-sm text-gray-800">
                  {product.category?.name || "—"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-orange-200/50">
              <td className="px-4 py-3 text-sm font-medium text-gray-700">Artisan</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-center text-sm text-gray-800">
                  {product.artisan?.name || "—"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-orange-200/50">
              <td className="px-4 py-3 text-sm font-medium text-gray-700">Stock</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-center text-sm text-gray-800">
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


