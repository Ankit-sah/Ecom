import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProductPayload } from "@/lib/product-service";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in?callbackUrl=/account/wishlist");
  const items = await prisma.wishlistItem.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { product: { include: { category: true, artisan: true } } } });
  const products = items.filter((item) => item.product.published).map((item) => toProductPayload(item.product));
  return <div className="mx-auto max-w-6xl space-y-8 px-4 py-12"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Saved pieces", href: "/account/wishlist" }]} /><header><p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Saved for later</p><h1 className="mt-3 font-serif text-4xl text-[#242b25]">Your wishlist</h1><p className="mt-3 text-sm text-neutral-600">Keep the handmade pieces you love in one place.</p></header>{products.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <section className="rounded-3xl border border-dashed border-[#ddcfbb] bg-white p-12 text-center"><p className="text-neutral-600">Your wishlist is waiting for its first piece.</p><Link href="/products" className="mt-5 inline-block rounded-full bg-[#b9472f] px-5 py-3 text-sm font-semibold text-white">Explore the collection</Link></section>}</div>;
}
