import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { getAllProducts } from "@/lib/product-service";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-16 px-4 py-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a2040]">Mithila marketplace</p>
        <h1 className="text-4xl font-semibold text-[#40111f]">All handcrafted treasures</h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-600">
          Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery, textiles,
          and decor crafted in Janakpur and destined for admirers around the world.
        </p>
      </section>

      <section className="mx-auto max-w-6xl space-y-6">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#8a2040]/40 bg-white/70 p-16 text-center">
            <p className="text-sm text-neutral-600">
              No products available yet. Visit the{" "}
              <Link href="/" className="font-semibold text-[#8a2040] underline-offset-2 hover:underline">
                home page
              </Link>{" "}
              to learn more or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

