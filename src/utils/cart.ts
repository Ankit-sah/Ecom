import type { CartItem, CartTotals } from "@/types/cart";

export function getCartTotals(items: CartItem[]): CartTotals {
  return items.reduce<CartTotals>(
    (acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.subtotalCents += item.quantity * item.product.priceCents;
      return acc;
    },
    { totalQuantity: 0, subtotalCents: 0 },
  );
}

