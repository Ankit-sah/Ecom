"use client";

import { FadeIn } from "@/components/ui/fade-in";

const qualities = [
  { title: "Generational craftsmanship", description: "Handmade works crafted by artisans who uphold traditional Mithila motifs.", icon: "✦" },
  { title: "Ethical sourcing", description: "Steady income opportunities for women-led collectives and underrepresented communities.", icon: "◉" },
  { title: "Global trust", description: "Delivering museum-grade Mithila art to clients worldwide with meticulous attention to detail.", icon: "◎" },
];

export function StorySection() {
  return (
    <section className="border-y border-[#ddcfbb] bg-[#fbf6ed]">
      <div className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[0.72fr_1.18fr_0.82fr]">
        <FadeIn className="min-h-[420px] lg:min-h-full">
          <div
            className="h-full min-h-[420px] bg-cover bg-center"
            style={{ backgroundImage: "linear-gradient(to top, rgba(24,63,55,.12), rgba(24,63,55,0)), url('https://images.unsplash.com/photo-1598965402089-897ce52e835b?auto=format&fit=crop&w=1200&q=82')" }}
            aria-hidden="true"
          />
        </FadeIn>

        <FadeIn delay={0.08} className="flex items-center">
          <div className="px-6 py-12 sm:px-10 lg:px-12 lg:py-16 xl:px-14">
            <div className="mb-5 flex items-center gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#31554d]">Our Story</span>
              <span className="h-px w-10 bg-[#b9472f]" />
            </div>
            <h2 className="[font-family:Georgia,serif] text-3xl leading-tight text-[#181b19] sm:text-4xl lg:text-[44px]">Rooted in Janakpur’s cultural renaissance</h2>
            <div className="mt-6 space-y-5 text-sm leading-7 text-[#625d54] sm:text-base">
              <p>Founded in 1993, Janakpur Art and Craft preserves traditional Mithila artistry while empowering artisan families across Nepal. From humble beginnings in Shankhamul, the collective now exports heritage jewellery, vessels, textiles, and paintings worldwide.</p>
              <p>By partnering with communities and cultural societies throughout Janakpur, we secure steady livelihoods and fair wages for the artisans who keep Mithila’s stories alive in every brushstroke.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Established 1993", "Family-led collective", "Exporting worldwide"].map((text) => (
                <div key={text} className="border border-[#ddcfbb] bg-[#f7efe2] px-4 py-3 text-center text-xs font-semibold text-[#31554d]">{text}</div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.16} className="flex items-center border-t border-[#ddcfbb] bg-[#faf5ec] lg:border-l lg:border-t-0">
          <div className="w-full px-6 py-10 sm:px-10 lg:px-8 xl:px-10">
            <h3 className="[font-family:Georgia,serif] text-2xl text-[#181b19] sm:text-3xl">Commitment to quality</h3>
            <div className="mt-5 divide-y divide-[#ddcfbb] border-y border-[#ddcfbb]">
              {qualities.map((item) => (
                <div key={item.title} className="flex gap-4 py-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efe2cc] text-lg text-[#31554d]">{item.icon}</div>
                  <div>
                    <h4 className="[font-family:Georgia,serif] text-lg font-semibold text-[#1c201e]">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-[#68645c]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
