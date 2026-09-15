"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function WishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/wishlist").then((response) => response.json()).then((data: { productIds?: string[] }) => setSaved(Boolean(data.productIds?.includes(productId)))).catch(() => undefined).finally(() => setReady(true));
  }, [productId]);

  async function toggle() {
    const response = await fetch(saved ? `/api/wishlist?productId=${productId}` : "/api/wishlist", saved ? { method: "DELETE" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    if (response.status === 401) return router.push(`/auth/sign-in?callbackUrl=/products`);
    if (response.ok) setSaved(!saved);
  }

  return <button type="button" onClick={toggle} disabled={!ready} aria-pressed={saved} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl transition disabled:opacity-50 ${saved ? "border-[#b9472f] bg-[#f9e4dd] text-[#b9472f]" : "border-[#ddcfbb] bg-white text-[#31554d] hover:border-[#b9472f]"}`} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}>{saved ? "♥" : "♡"}</button>;
}
