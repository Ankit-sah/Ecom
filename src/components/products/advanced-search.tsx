"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Suggestion = {
  type: "product" | "category" | "artisan";
  id: string;
  name: string;
  slug?: string;
  image?: string;
};

type SearchSuggestions = {
  products: Suggestion[];
  categories: Suggestion[];
  artisans: Suggestion[];
};

export function AdvancedSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(null);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Save to search history
      try {
        await fetch("/api/search/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, results: 0 }),
        });
      } catch (error) {
        console.error("Failed to save search history:", error);
      }
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const totalSuggestions = suggestions
    ? suggestions.products.length + suggestions.categories.length + suggestions.artisans.length
    : 0;

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="Search products, categories, artisans..."
          className="w-full rounded-full border border-orange-200 bg-white/90 px-4 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:px-6 sm:py-3 sm:pl-12"
          aria-label="Search products"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 sm:left-4">
          <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        )}
      </form>

      {showSuggestions && totalSuggestions > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-orange-200 bg-white shadow-lg">
          <div className="max-h-96 overflow-y-auto p-2">
            {suggestions!.products.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Products
                </p>
                {suggestions!.products.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-orange-50"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <span className="text-sm text-gray-800">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {suggestions!.categories.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Categories
                </p>
                {suggestions!.categories.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/category/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-orange-50"
                  >
                    <span className="text-sm text-gray-800">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {suggestions!.artisans.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Artisans
                </p>
                {suggestions!.artisans.map((item) => (
                  <Link
                    key={item.id}
                    href={`/artisans?search=${encodeURIComponent(item.name)}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-orange-50"
                  >
                    <span className="text-sm text-gray-800">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


