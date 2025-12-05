"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page on new search
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full border border-[#f6b2c5]/70 bg-white/90 px-6 py-3 pl-12 pr-4 text-sm text-[#40111f] placeholder-neutral-400 focus:border-[#8a2040] focus:outline-none focus:ring-2 focus:ring-[#8a2040]/20"
          aria-label="Search products"
        />
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8a2040] border-t-transparent" />
          </div>
        )}
      </div>
    </form>
  );
}

