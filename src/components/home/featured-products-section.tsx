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
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="paper-texture border-b border-[#ddcfbb]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:px-16 lg:py-16 xl:px-20">
        <FadeIn className="flex items-center">
          <div className="max-w-md">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-10 bg-[#b9472f]" />
            </div>
            <h2 className="font-editorial text-4xl leading-tight text-[#181b19] sm:text-5xl">Featured Mithila creations</h2>
            <p className="mt-4 text-sm leading-7 text-[#625d54] sm:text-base">
              Handpicked treasures that celebrate ancestral motifs, natural dyes, and the spirit of Janakpur.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center border-b border-[#b9472f] pb-1 text-sm font-semibold text-[#b9472f] transition hover:text-[#923622]"
            >
              View all <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </FadeIn>

        {products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {products.slice(0, 2).map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="border border-dashed border-[#c6b49d] bg-[#fbf6ed] p-10 text-sm text-[#68645c]">
            Our artisans are crafting new pieces. Please check back soon to discover the next chapter of Mithila art.
          </p>
        )}
      </div>
    </section>
  );
}
