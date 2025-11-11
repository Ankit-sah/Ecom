export function SiteFooter() {
  return (
    <footer className="border-t border-[#f3b3c3] bg-white/80 py-6 text-sm text-neutral-600">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center md:flex-row md:text-left">
        <p className="font-medium text-[#8a2040]">© {new Date().getFullYear()} Janakpur Art and Craft</p>
        <p className="max-w-xl text-neutral-600">
          Since 1993 we’ve championed Janakpur’s Mithila artisans—crafting jewellery, vessels, textiles, and paintings
          exported worldwide with uncompromising quality.
        </p>
      </div>
    </footer>
  );
}

