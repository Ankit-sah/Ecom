import type { Product } from "@/types/product";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CheckoutPayload = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type CartTotals = {
  totalQuantity: number;
  subtotalCents: number;
};

export type { Product };

