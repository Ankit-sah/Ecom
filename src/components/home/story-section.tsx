"use client";

import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function StorySection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <motion.div
        className="space-y-5 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.08 }}
      >
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]"
          variants={cardVariants}
        >
          Our Story
        </motion.p>
        <motion.h2 className="text-3xl font-semibold text-[#40111f]" variants={cardVariants}>
          Rooted in Janakpur’s cultural renaissance
        </motion.h2>
        <motion.p className="text-sm leading-relaxed text-neutral-700" variants={cardVariants}>
          Founded in 1993, Janakpur Art and Craft preserves traditional Mithila artistry while empowering artisan families
          across Nepal. From humble beginnings in Shankhamul, the collective now exports heritage jewellery, vessels,
          textiles, and paintings worldwide.
        </motion.p>
        <motion.p className="text-sm leading-relaxed text-neutral-700" variants={cardVariants}>
          By partnering with communities and cultural societies throughout Janakpur, we secure steady livelihoods and
          fair wages for the artisans who keep Mithila’s stories alive in every brushstroke.
        </motion.p>
        <motion.div className="flex flex-wrap gap-4" variants={cardVariants}>
          {["Established 1993", "Family-led collective", "Exporting worldwide"].map((text) => (
            <span
              key={text}
              className="rounded-2xl border border-[#f6b2c5]/50 bg-[#ffe1ef]/60 px-5 py-3 text-sm font-semibold text-[#8a2040]"
            >
              {text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="space-y-5 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.h3 className="text-2xl font-semibold text-[#40111f]" variants={cardVariants}>
          Commitment to quality
        </motion.h3>
        <motion.ul className="space-y-4 text-sm text-neutral-700" variants={cardVariants}>
          <li>
            <span className="font-semibold text-[#8a2040]">Generational craftsmanship:</span> Handmade works crafted by
            artisans who uphold traditional Mithila motifs.
          </li>
          <li>
            <span className="font-semibold text-[#8a2040]">Ethical sourcing:</span> Steady income opportunities for
            women-led collectives and underrepresented communities.
          </li>
          <li>
            <span className="font-semibold text-[#8a2040]">Global trust:</span> Delivering museum-grade Mithila art to
            clients worldwide with meticulous attention to detail.
          </li>
        </motion.ul>
      </motion.div>
    </section>
  );
}

