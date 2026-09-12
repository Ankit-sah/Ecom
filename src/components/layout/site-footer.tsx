import Link from "next/link";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Featured", href: "/products?filter=featured" },
    { label: "Categories", href: "/products" },
  ],
  About: [
    { label: "Our Story", href: "/about" },
    { label: "Artisans", href: "/artisans" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-[#183f37] text-[#f6efe5]" aria-label="Site footer">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2fr_0.55fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4a978]/60 text-[#d7a36d]" aria-hidden="true">✦</span>
              <h2 className="font-editorial text-2xl">Janakpur Art and Craft</h2>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#e0d8cd]">
              Since 1993 we&apos;ve championed Janakpur&apos;s Mithila artisans—crafting jewellery, vessels, textiles, and paintings exported worldwide with uncompromising quality.
            </p>
            <p className="mt-5 text-xs font-medium text-[#d7a36d]">
              Handcrafted in Nepal • Supporting women-led artisan collectives
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-editorial text-lg text-white">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-[#d8d0c5] transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="hidden items-end justify-end lg:flex" aria-hidden="true">
            <svg viewBox="0 0 120 170" className="h-40 w-28 text-[#d7a36d]" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M60 165V45M60 72C42 60 33 44 34 29c16 4 26 14 26 33M61 100c18-11 27-27 26-42-16 4-26 14-26 33M59 129c-18-10-27-26-26-42 16 4 26 15 26 33M61 149c16-8 25-20 26-34-15 3-25 12-26 26" />
              <path d="M60 45c-12-8-18-21-15-36 8 2 14 8 17 16 4-9 10-14 18-17 3 15-3 28-15 37" />
            </svg>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 bg-[#14372f]">
        <div className="mx-auto max-w-[1440px] px-6 py-4 text-xs text-[#cfc7bc] sm:px-10 lg:px-16 xl:px-20">
          © 2026 Janakpur Art and Craft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
