"use client";

import { useEffect } from "react";
import { useCart } from "@/providers/cart-provider";

export function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart when success page loads
    clearCart();
  }, [clearCart]);

  return null;
}

