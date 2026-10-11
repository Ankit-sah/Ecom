import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import { formatCurrencyFromCents } from "@/utils/format";
function periodStart(days: number) { return new Date(Date.now() - days * 86400000); }
export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireRole(["ADMIN", "STAFF", "ARTISAN_MANAGER"]);
  const query = await searchParams;
  const days = [7, 30, 90].includes(Number(query.days)) ? Number(query.days) : 30;
  const since = periodStart(days);
  const productViewWhere = { createdAt: { gte: since }, event: "page_view", path: { startsWith: "/products/" }, NOT: { path: { startsWith: "/products/category/" } } };
  const [events, orders, stock, products, productPageViews] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ["event"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    prisma.order.groupBy({ by: ["status", "currency"], where: { createdAt: { gte: since } }, _count: { _all: true }, _sum: { totalCents: true } }),
    prisma.product.findMany({ where: { published: true, stock: { lte: 5 } }, select: { id: true, name: true, stock: true }, orderBy: { stock: "asc" }, take: 50 }),
    prisma.analyticsEvent.groupBy({ by: ["path"], where: productViewWhere, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
    prisma.analyticsEvent.count({ where: productViewWhere }),
  ]);
  const counts = { ...Object.fromEntries(events.map(e => [e.event, e._count._all])), product_views: productPageViews } as Record<string, number>;
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">Store analytics</h1><nav className="flex gap-4">{[7,30,90].map(value => <Link key={value} href={`?days=${value}`} aria-current={days === value ? "page" : undefined}>Last {value} days</Link>)}</nav><p>Event counts are activity totals, not unique customers or conversion rates. Order outcomes use orders created in this period; stock is current.</p>{process.env.ANALYTICS_ENABLED !== "true" && <p className="rounded border p-3">Analytics collection is disabled. Historical events and operational data are still shown.</p>}<div className="grid gap-4 sm:grid-cols-3">{[["Product views", "product_views"], ["Page views", "page_view"],["Add to cart", "add_to_cart"],["Checkout starts", "checkout_started"],["Payment starts", "payment_started"],["Payment completion events", "payment_succeeded"],["Client errors", "client_error"]].map(([label,key]) => <section key={key} className="rounded-2xl border bg-white p-5"><h2>{label}</h2><p className="text-3xl font-semibold">{counts[key] ?? 0}</p></section>)}</div><section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-semibold">Order outcomes</h2>{orders.map(row => <p key={`${row.status}-${row.currency}`}>{row.status}: {row._count._all} orders{["PAID", "FULFILLED"].includes(row.status) ? ` · Revenue ${formatCurrencyFromCents(row._sum.totalCents ?? 0, "en-US", row.currency)}` : ""}</p>)}</section><section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-semibold">Low stock alerts (5 or fewer)</h2><p className="text-sm text-neutral-600">Showing up to 50 published products, lowest stock first.</p>{!stock.length && <p>No low stock products.</p>}{stock.map(p => <p key={p.id}>{p.name}: {p.stock === 0 ? "Out of stock" : `${p.stock} remaining`}</p>)}</section><section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-semibold">Most viewed product pages</h2>{products.map(row => <p key={row.path}>{row.path} · {row._count._all} views</p>)}{!products.length && <p>No product page events in this period.</p>}</section></div>;
}
