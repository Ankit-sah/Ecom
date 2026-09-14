import Link from "next/link";

const promises = [
  { title: "Secure local payments", body: "Pay confidently with eSewa or Khalti at checkout.", href: "/checkout", icon: "⌁" },
  { title: "Careful delivery", body: "Each handmade piece is packed with protection and dispatch updates.", href: "/shipping", icon: "↗" },
  { title: "Support when needed", body: "Clear shipping, returns, and care guidance before you buy.", href: "/faq", icon: "?" },
];

export function ShopPromisesSection() {
  return (
    <section className="border-b border-[#ddcfbb] bg-white">
      <div className="mx-auto grid max-w-[1440px] divide-y divide-[#ddcfbb] md:grid-cols-3 md:divide-x md:divide-y-0">
        {promises.map((promise) => (
          <Link key={promise.title} href={promise.href} className="group flex gap-4 px-6 py-7 transition hover:bg-[#fbf6ed] sm:px-10 lg:px-16">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5eadb] font-serif text-lg text-[#b9472f] transition group-hover:bg-[#b9472f] group-hover:text-white" aria-hidden="true">{promise.icon}</span>
            <span>
              <span className="block text-sm font-semibold text-[#242b25]">{promise.title}</span>
              <span className="mt-1 block text-sm leading-6 text-neutral-600">{promise.body}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
