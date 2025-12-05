"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem, Product } from "@/types/cart";
import { getCartTotals } from "@/utils/cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "ecom-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored) as CartItem[];
    } catch (error) {
      console.error("Failed to parse cart from storage", error);
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item,
        );
      }
      return [...current, { product, quantity: Math.min(quantity, product.stock) }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.product.stock)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Sync cart with current stock levels - remove out of stock items
  // This runs once on mount to clean up any stale cart items
  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") return;

    let isMounted = true;
    const initialItems = items; // Capture initial items for this effect

    const syncCartWithStock = async () => {
      try {
        const response = await fetch("/api/products/stock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: initialItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          }),
        });

        if (response.ok && isMounted) {
          const stockData = (await response.json()) as {
            allAvailable: boolean;
            items: Array<{
              productId: string;
              available: boolean;
              availableStock?: number;
            }>;
          };

          // Remove items that are no longer available or adjust quantities
          setItems((current) =>
            current
              .map((item) => {
                const stockInfo = stockData.items.find((s) => s.productId === item.product.id);
                if (!stockInfo || !stockInfo.available) {
                  return null; // Remove unavailable items
                }
                // Adjust quantity if stock is less than requested
                if (stockInfo.availableStock !== undefined && stockInfo.availableStock < item.quantity) {
                  return { ...item, quantity: stockInfo.availableStock };
                }
                return item;
              })
              .filter((item): item is CartItem => item !== null)
          );
        }
      } catch (error) {
        console.error("Failed to sync cart with stock:", error);
      }
    };

    syncCartWithStock();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - initialItems is captured from items at mount time

  const totals = useMemo(() => getCartTotals(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalQuantity: totals.totalQuantity,
      subtotalCents: totals.subtotalCents,
    }),
    [addItem, clearCart, items, removeItem, totals, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

