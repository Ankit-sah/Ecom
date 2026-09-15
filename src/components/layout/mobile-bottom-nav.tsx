"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Shop", icon: "⌂" },
  { href: "/products?featured=true", label: "Featured", icon: "✦" },
  { href: "/about", label: "Our story", icon: "▤" },
  { href: "/artisans", label: "Artisans", icon: "♧" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ddcfbb] bg-[#fffdf9]/95 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(36,43,37,.08)] backdrop-blur md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("?")[0]);
          return (
            <Link key={link.label} href={link.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition ${active ? "bg-[#f5eadb] text-[#b9472f]" : "text-neutral-500 hover:bg-[#fbf6ed] hover:text-[#31554d]"}`}>
              <span className="font-serif text-lg leading-none" aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
