import Link from "next/link";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Featured", href: "/products?filter=featured" },
    { label: "Categories", href: "/products" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Artisans", href: "/artisans" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#f3b3c3] bg-white/80" aria-label="Site footer">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-4 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-orange-500">Janakpur Art and Craft</h2>
            <p className="mt-3 text-xs text-neutral-600 sm:text-sm">
              Since 1993 we&apos;ve championed Janakpur&apos;s Mithila artisans—crafting jewellery, vessels, textiles, and
              paintings exported worldwide with uncompromising quality.
            </p>
            <p className="mt-4 text-xs text-neutral-500">
              Handcrafted in Nepal • Supporting women-led artisan collectives
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-orange-500">Shop</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-neutral-600 transition hover:text-orange-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-orange-500">About</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-neutral-600 transition hover:text-orange-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-orange-500">Support</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-neutral-600 transition hover:text-orange-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.1em] text-orange-500">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-neutral-600 transition hover:text-orange-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#f3b3c3] pt-6 sm:mt-10 sm:pt-8 md:mt-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-neutral-600">
              © {currentYear} Janakpur Art and Craft. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
