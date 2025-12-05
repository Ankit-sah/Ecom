import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

type RelatedProductsProps = {
  products: Product[];
  currentProductSlug: string;
};

export function RelatedProducts({ products, currentProductSlug }: RelatedProductsProps) {
  const filteredProducts = products.filter((p) => p.slug !== currentProductSlug).slice(0, 4);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#40111f]">You might also like</h2>
        <Link
          href="/products"
          className="text-sm font-semibold text-[#8a2040] transition hover:text-[#6f1731] hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

