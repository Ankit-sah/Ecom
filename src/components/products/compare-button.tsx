"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CompareButtonProps = {
  productId: string;
  variant?: "default" | "icon";
};

export function CompareButton({ productId, variant = "default" }: CompareButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCompare = async () => {
    setLoading(true);
    try {
      // Get current comparison
      const currentResponse = await fetch("/api/products/compare");
      const current = await currentResponse.json();
      const currentProductIds = current.products?.map((p: { id: string }) => p.id) || [];

      if (currentProductIds.includes(productId)) {
        // Already in comparison, go to compare page
        router.push("/compare");
        return;
      }

      if (currentProductIds.length >= 4) {
        alert("Maximum 4 products can be compared at once. Please remove one first.");
        return;
      }

      // Add to comparison (allow single product for first addition)
      const newProductIds = [...currentProductIds, productId];
      const response = await fetch("/api/products/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: newProductIds }),
      });

      if (response.ok) {
        // Only navigate if we have at least 2 products, otherwise just save silently
        if (newProductIds.length >= 2) {
          router.push("/compare");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to add to comparison");
      }
    } catch (error) {
      console.error("Failed to add to comparison:", error);
      alert("Failed to add to comparison");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCompare}
        disabled={loading}
        className="rounded-full p-2 transition hover:bg-orange-50 disabled:opacity-50"
        aria-label="Add to comparison"
      >
        <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCompare}
      disabled={loading}
      className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 disabled:opacity-50"
    >
      {loading ? "Adding..." : "Compare"}
    </button>
  );
}


