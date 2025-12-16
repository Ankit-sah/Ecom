"use client";

import { FadeIn } from "@/components/ui/fade-in";

export function StorySection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 sm:gap-8 md:gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <FadeIn className="h-full">
        <div className="flex h-full flex-col justify-between space-y-4 rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition hover:shadow-md sm:rounded-[32px] sm:space-y-5 sm:p-8 md:p-10">
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-600">
              Our Story
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl md:text-4xl">
              Rooted in Janakpur’s cultural renaissance
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-neutral-700 sm:text-base">
              <p>
                Founded in 1993, Janakpur Art and Craft preserves traditional Mithila artistry while empowering artisan families
                across Nepal. From humble beginnings in Shankhamul, the collective now exports heritage jewellery, vessels,
                textiles, and paintings worldwide.
              </p>
              <p>
                By partnering with communities and cultural societies throughout Janakpur, we secure steady livelihoods and
                fair wages for the artisans who keep Mithila’s stories alive in every brushstroke.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            {["Established 1993", "Family-led collective", "Exporting worldwide"].map((text) => (
              <span
                key={text}
                className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-orange-600"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="h-full">
        <div className="flex h-full flex-col justify-center gap-5 rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition hover:shadow-md sm:rounded-[32px] sm:gap-6 sm:p-8 md:p-10">
          <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Commitment to quality
          </h3>
          <ul className="space-y-5 text-sm text-neutral-700 sm:space-y-6 sm:text-base">
            <li className="flex gap-4">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[orange-500]" />
              <div>
                <span className="block font-bold text-orange-500">Generational craftsmanship</span>
                Handmade works crafted by artisans who uphold traditional Mithila motifs.
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[orange-500]" />
              <div>
                <span className="block font-bold text-orange-500">Ethical sourcing</span>
                Steady income opportunities for women-led collectives and underrepresented communities.
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[orange-500]" />
              <div>
                <span className="block font-bold text-orange-500">Global trust</span>
                Delivering museum-grade Mithila art to clients worldwide with meticulous attention to detail.
              </div>
            </li>
          </ul>
        </div>
      </FadeIn>
    </section>
  );
}
