import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/utils/format";

async function getOverview() {
  const [productCount, publishedCount, orderStats, artisans, pendingImports] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
    prisma.artisan.count(),
    prisma.catalogImportJob.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
  ]);

  const activeOrders = await prisma.order.count({
    where: { status: { in: ["PENDING", "PAID"] } },
  });

  return {
    productCount,
    publishedCount,
    orders: {
      total: orderStats._count._all ?? 0,
      revenueCents: orderStats._sum.totalCents ?? 0,
      active: activeOrders,
    },
    artisans,
    pendingImports,
  };
}

export default async function AdminOverviewPage() {
  const overview = await getOverview();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-orange-200/70 bg-white/90 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">Operational snapshot</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Monitor catalogue health, revenue, and artisan participation across the Janakpur Art and Craft network.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-orange-200/60 bg-orange-50/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Catalogue</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">{overview.productCount}</p>
            <p className="text-xs text-neutral-600">
              {overview.publishedCount} published • {overview.productCount - overview.publishedCount} in draft
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/60 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Orders</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">{overview.orders.total}</p>
            <p className="text-xs text-neutral-600">
              {overview.orders.active} active • Revenue {formatCurrencyFromCents(overview.orders.revenueCents)}
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200/60 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Artisans</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">{overview.artisans}</p>
            <p className="text-xs text-neutral-600">Active collectives across Janakpur and Kathmandu.</p>
          </div>
          <div className="rounded-2xl border border-orange-200/60 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Import jobs</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">{overview.pendingImports}</p>
            <p className="text-xs text-neutral-600">Uploads pending processing.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-200/70 bg-white/90 p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">Next actions</h3>
        <ul className="mt-4 space-y-3 text-sm text-neutral-700">
          <li>• Review new catalogue submissions and publish items once photography is approved.</li>
          <li>• Reconcile Stripe payouts and fulfil pending export orders.</li>
          <li>• Invite additional artisans to onboard via the artisan manager portal.</li>
          <li>• Schedule the next bulk import from Janakpur warehouse inventory.</li>
        </ul>
      </section>
    </div>
  );
}

