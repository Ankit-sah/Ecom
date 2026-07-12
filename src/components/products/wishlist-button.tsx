"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type WishlistButtonProps = {
  productId: string;
  variant?: "default" | "icon";
};

export function WishlistButton({ productId, variant = "default" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      checkWishlistStatus();
    }
  }, [session, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const wishlist = await response.json();
        setIsInWishlist(wishlist.some((item: { productId: string }) => item.productId === productId));
      }
    } catch (error) {
      console.error("Failed to check wishlist status:", error);
    }
  };

  const handleToggle = async () => {
    if (!session?.user) {
      router.push("/auth/sign-in");
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsInWishlist(false);
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (response.ok) {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className="rounded-full p-2 transition hover:bg-orange-50 disabled:opacity-50"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className={`h-5 w-5 ${isInWishlist ? "fill-orange-500 text-orange-500" : "text-neutral-400"}`}
          fill={isInWishlist ? "currentColor" : "none"}
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
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 disabled:opacity-50"
    >
      <svg
        className={`h-5 w-5 ${isInWishlist ? "fill-orange-500" : ""}`}
        fill={isInWishlist ? "currentColor" : "none"}
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
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </button>
  );
}


