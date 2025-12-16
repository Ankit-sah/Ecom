"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ProductFiltersProps = {
  categories: Array<{ id: string; name: string; slug: string }>;
  artisans: Array<{ id: string; name: string }>;
  maxPrice: number;
};

export function ProductFilters({ categories, artisans, maxPrice }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to first page on filter change
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const currentCategory = searchParams.get("category") || "all";
  const currentArtisan = searchParams.get("artisan") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const featured = searchParams.get("featured") === "true";

  return (
    <div className="space-y-6 rounded-3xl border border-orange-200 bg-white/85 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Filters</h2>

      <div className="space-y-4">
        <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-orange-500">
            Category
          </label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            disabled={isPending}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label htmlFor="artisan" className="mb-2 block text-sm font-medium text-orange-500">
            Artisan
          </label>
          <select
            id="artisan"
            value={currentArtisan}
            onChange={(e) => updateFilter("artisan", e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            disabled={isPending}
          >
            <option value="all">All Artisans</option>
            {artisans.map((artisan) => (
              <option key={artisan.id} value={artisan.name}>
                {artisan.name}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label htmlFor="sort" className="mb-2 block text-sm font-medium text-orange-500">
            Sort By
          </label>
          <select
            id="sort"
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            disabled={isPending}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-orange-500">Price Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              max={maxPrice}
              value={currentMinPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value || null)}
              className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              disabled={isPending}
            />
            <input
              type="number"
              placeholder="Max"
              min="0"
              max={maxPrice}
              value={currentMaxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value || null)}
              className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => updateFilter("featured", e.target.checked ? "true" : null)}
              className="h-4 w-4 rounded border-orange-200 text-orange-500 focus:ring-orange-500"
              disabled={isPending}
            />
            <span className="text-sm text-gray-800">Featured Only</span>
          </label>
        </div>

        {(currentCategory !== "all" ||
          currentArtisan !== "all" ||
          currentMinPrice ||
          currentMaxPrice ||
          featured) && (
          <button
            onClick={() => {
              startTransition(() => {
                router.push("/products");
              });
            }}
            className="w-full rounded-lg border border-orange-500/40 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:border-orange-500 hover:bg-orange-50"
            disabled={isPending}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

