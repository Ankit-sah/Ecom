"use client";

import { useState } from "react";

import { OptimizedImage } from "@/components/products/optimized-image";

type Props = { images: string[]; name: string; category?: string | null; artisan?: string | null };

export function ProductGallery({ images, name, category, artisan }: Props) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="flex aspect-square items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-500">No image available</div>;
  const alt = `${name}${category ? ` — ${category}` : ""}${artisan ? `, crafted by ${artisan}` : ""}`;
  const show = (next: number) => setActive((next + images.length) % images.length);

  return <div className="space-y-3">
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-[#ddcfbb] bg-[#f5eadb] sm:rounded-3xl">
      <OptimizedImage src={images[active]} alt={active ? `${alt}, view ${active + 1}` : alt} fill context="detail" className="object-cover" priority />
      {images.length > 1 && <>
        <button type="button" onClick={() => show(active - 1)} aria-label="Previous product image" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#31554d] opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100">←</button>
        <button type="button" onClick={() => show(active + 1)} aria-label="Next product image" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#31554d] opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100">→</button>
        <span className="absolute bottom-3 right-3 rounded-full bg-[#242b25]/75 px-3 py-1 text-xs font-medium text-white">{active + 1} / {images.length}</span>
      </>}
    </div>
    {images.length > 1 && <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Product image thumbnails">
      {images.map((image, index) => <button key={image} type="button" onClick={() => setActive(index)} aria-label={`Show product image ${index + 1}`} aria-current={active === index} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${active === index ? "border-[#31554d]" : "border-transparent hover:border-[#ddcfbb]"}`}>
        <OptimizedImage src={image} alt="" fill context="thumbnail" className="object-cover" />
      </button>)}
    </div>}
  </div>;
}
