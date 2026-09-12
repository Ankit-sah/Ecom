"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";

export function HeroSection() {
  return (
    <section className="paper-texture border-b border-[#ddcfbb]">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid min-h-[620px] md:grid-cols-[0.94fr_1.06fr]">
          <div className="relative flex items-center px-6 py-14 sm:px-10 lg:px-16 xl:px-20">
            <div className="absolute left-0 top-10 hidden h-56 w-20 opacity-30 lg:block">
              <svg viewBox="0 0 80 220" className="h-full w-full text-[#b9472f]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M40 215V54M40 75C27 67 19 55 18 42c13 2 22 10 22 25M41 105c14-8 22-20 22-34-13 2-22 10-22 25M39 139c-13-8-21-20-22-34 13 2 21 10 22 25M41 168c13-8 21-20 22-34-13 2-21 10-22 25" />
                <path d="M40 54c-12-7-17-18-15-31 9 2 15 7 18 15 3-9 9-14 18-16 2 13-3 24-15 31" />
              </svg>
            </div>

            <FadeIn className="relative z-10 max-w-[620px] space-y-7 lg:pl-8">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#31554d] sm:text-xs">
                  Hand-painted traditions
                </span>
                <span className="h-px w-12 bg-[#b9472f]" />
              </div>

              <h1 className="font-editorial text-4xl leading-[1.08] tracking-[-0.025em] text-[#171b19] sm:text-5xl lg:text-[64px]">
                Use Janakpur Art and Craft—custodians of Mithila artistry since 1993.
              </h1>

              <p className="max-w-xl text-base leading-7 text-[#5d5b55] sm:text-lg sm:leading-8">
                Discover vibrant Madhubani paintings, handwoven textiles, and decor inspired by Janakpur’s folklore. Each piece celebrates the artisans who bring this heritage to life.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center justify-center bg-[#b9472f] px-7 text-sm font-semibold text-white transition hover:bg-[#923622] focus:outline-none focus:ring-2 focus:ring-[#b9472f] focus:ring-offset-2"
                >
                  Explore the gallery <span className="ml-2" aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/artisans"
                  className="inline-flex h-12 items-center justify-center border border-[#b9472f] bg-[#fbf6ed]/70 px-7 text-sm font-semibold text-[#633023] transition hover:bg-[#f2e7d6] focus:outline-none focus:ring-2 focus:ring-[#b9472f] focus:ring-offset-2"
                >
                  Meet the artisans
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.12} direction="left" className="relative min-h-[460px] overflow-hidden md:min-h-full">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1598965402089-897ce52e835b?auto=format&fit=crop&w=1600&q=88')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7f0e4]/15 via-transparent to-[#183f37]/10" />
          </FadeIn>
        </div>

        <div className="grid border-t border-[#ddcfbb] bg-[#f5eadb] md:grid-cols-[0.78fr_1.22fr]">
          <div className="flex items-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
            <FadeIn className="max-w-lg space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6d5b48]">Festival collection</span>
                <span className="h-px w-10 bg-[#b9472f]" />
              </div>
              <h2 className="font-editorial text-4xl text-[#181b19] sm:text-5xl">Rangoli Reverie</h2>
              <p className="text-sm leading-7 text-[#625d54] sm:text-base">
                Limited-edition wall plates and textiles inspired by the harvest season and the grace of Maithili folklore.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e7d7b8] px-4 py-2 text-xs font-semibold text-[#31554d]">
                <span aria-hidden="true">✦</span> Ethically crafted
              </span>
            </FadeIn>
          </div>
          <div className="relative min-h-[300px] overflow-hidden">
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1598965402089-897ce52e835b?auto=format&fit=crop&w=1600&q=88')" }}
            />
            <div className="absolute inset-0 bg-[#7f341f]/20 mix-blend-multiply" />
          </div>
        </div>
      </div>
    </section>
  );
}
