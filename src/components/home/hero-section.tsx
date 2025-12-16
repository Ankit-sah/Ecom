"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#fff9f0]">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-bg-orange-50 mix-blend-multiply opacity-70 blur-3xl filter" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#fae8b4] mix-blend-multiply opacity-70 blur-3xl filter" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 md:flex-row md:items-center md:gap-16 lg:px-8 lg:py-32">

        {/* Text Content */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <FadeIn delay={0.1}>
            <span className="inline-flex items-center rounded-full bg-bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-text-orange-600 shadow-sm ring-1 ring-border-orange-200">
              Hand-painted traditions
            </span>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-3xl font-bold tracking-tight text-text-gray-800 sm:text-4xl md:text-5xl lg:text-[64px] lg:leading-[1.1]">
              Use Janakpur Art and Craft—custodians of Mithila artistry since 1993.
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-700 md:mx-0 md:text-xl">
              Discover vibrant Madhubani paintings, handwoven textiles, and decor inspired by Janakpur’s folklore. Each
              piece celebrates the artisans who bring this heritage to life.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 md:justify-start">
              <Link
                href="/products"
                className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-text-bg-orange-500 px-6 text-sm font-medium text-white shadow-lg shadow-text-bg-orange-500/20 transition-all duration-300 hover:bg-text-orange-600 hover:shadow-xl hover:shadow-text-bg-orange-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-text-bg-orange-500 focus:ring-offset-2 sm:h-12 sm:px-8 sm:text-base"
              >
                <span className="relative z-10">Explore the gallery</span>
              </Link>
              <Link
                href="/products?filter=featured"
                className="inline-flex h-11 items-center justify-center rounded-full border-2 border-text-bg-orange-500/20 px-6 text-sm font-medium text-text-bg-orange-500 transition-colors hover:border-text-bg-orange-500 hover:bg-bg-orange-50 focus:outline-none focus:ring-2 focus:ring-text-bg-orange-500 focus:ring-offset-2 sm:h-12 sm:px-8 sm:text-base"
              >
                Meet the artisans
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Visual Content (Card) */}
        <div className="flex-1">
          <FadeIn delay={0.5} direction="left" className="h-full flex justify-center md:justify-end">
            <div className="group relative w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[6px] border-white bg-white shadow-2xl">
                {/* Image Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f5d0a9] via-[#f7a3c5] to-[#f45a8d]">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598965402089-897ce52e835b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-8 md:p-10">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-200">
                      Festival collection
                    </p>
                    <h2 className="font-serif text-4xl font-semibold leading-tight text-white drop-shadow-sm">
                      Rangoli Reverie
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium leading-relaxed text-white/90">
                      Limited-edition wall plates and textiles inspired by the harvest season and the grace of Maithili folklore.
                    </p>
                    <div className="h-px w-full bg-white/30" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-white/80">Ethically crafted</p>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-full border border-dashed border-white/60 p-2"
                      >
                        <div className="h-full w-full rounded-full bg-yellow-400/20" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative behind card */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-[40px] bg-text-bg-orange-500/10" />
            </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}
