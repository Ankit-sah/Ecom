"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { FadeIn } from "@/components/ui/fade-in";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";

type FeaturedProductsSectionProps = {
  products: Product[];
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FadeIn>
          <div>
            <h2 className="text-2xl font-semibold text-[#40111f]">Featured Mithila creations</h2>
            <p className="text-sm text-neutral-600">
              Handpicked treasures that celebrate ancestral motifs, natural dyes, and the spirit of Janakpur.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1} direction="left">
          <Link href="/products" className="text-sm font-semibold text-[#8a2040] transition hover:text-[#6f1731]">
            View all
          </Link>
        </FadeIn>
      </div>

      {products.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="rounded-3xl border border-dashed border-[#8a2040]/30 bg-white/70 p-10 text-sm text-neutral-600">
          Our artisans are crafting new pieces. Please check back soon to discover the next chapter of Mithila art.
        </p>
      )}
    </section>
  );
}

