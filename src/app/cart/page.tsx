import { CartPageClient } from "@/components/cart/cart-page-client";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div className="px-4 py-16">
      <CartPageClient />
    </div>
  );
}

