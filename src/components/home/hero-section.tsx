"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white/90">
      <div className="absolute inset-x-0 top-[-180px] mx-auto h-72 w-72 rounded-full bg-[#ffe5f1] blur-3xl md:h-96 md:w-96" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:gap-16 lg:py-24">
        <motion.div
          className="flex-1 space-y-6"
          initial="hidden"
          animate="visible"
          variants={heroVariants}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center rounded-full bg-[#ffe1ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a2040]">
            Hand-painted traditions
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[#40111f] sm:text-4xl lg:text-[56px]">
            Experience Janakpur Art and Craft—custodians of Mithila artistry since 1993.
          </h1>
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            Discover vibrant Madhubani paintings, handwoven textiles, and decor inspired by Janakpur’s folklore. Each
            piece celebrates the artisans who bring this heritage to life.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:-translate-y-0.5 hover:bg-[#6f1731]"
            >
              Explore the gallery
            </Link>
            <Link
              href="/products?filter=featured"
              className="rounded-full border border-[#8a2040]/40 px-6 py-3 text-sm font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
            >
              Meet the artisans
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-1 justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="group relative h-80 w-full max-w-sm overflow-hidden rounded-[32px] border-4 border-[#f7b42c] bg-gradient-to-br from-[#f5d0a9] via-[#f7a3c5] to-[#f45a8d] p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598965402089-897ce52e835b?auto=format&fit=crop&w=800&q=80')] opacity-30 mix-blend-overlay transition duration-700 group-hover:scale-110" />
            <div className="relative flex h-full flex-col justify-between space-y-4">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-yellow-100">Festival collection</p>
                <h2 className="text-3xl font-semibold">Rangoli Reverie</h2>
                <p className="text-sm text-yellow-50">
                  Limited-edition wall plates and textiles inspired by the harvest season and the grace of Maithili folklore.
                </p>
              </div>
              <div className="space-y-3 text-yellow-50">
                <p className="text-xs uppercase tracking-[0.4em]">Ethically crafted</p>
                <p className="text-sm">
                  Sustainably sourced materials directly supporting women-led artisan collectives across Janakpur.
                </p>
              </div>
            </div>
            <motion.div
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

