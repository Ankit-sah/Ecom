import "server-only";

import { revalidatePath } from "next/cache";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import { formatCurrencyFromCents } from "@/utils/format";

async function fetchOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              artisan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      shipment: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    take: 50,
  });

  return orders;
}

async function updateOrderStatus(orderId: string, status: string, note?: string) {
  "use server";
  const session = await requireRole(["ADMIN", "STAFF", "ARTISAN_MANAGER"]);
  const normalizedStatus = status as "PENDING" | "PAID" | "FULFILLED" | "CANCELLED" | "FAILED" | "REFUNDED";

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: normalizedStatus,
      updatedAt: new Date(),
      statusHistory: {
        create: {
          status: normalizedStatus,
          note: note ?? null,
          actorId: session.user?.email ?? null,
        },
      },
    },
  });

  revalidatePath("/admin/orders");
}

async function updateFulfillmentStage(orderId: string, stage: string, trackingNumber?: string) {
  "use server";
  await requireRole(["ADMIN", "STAFF", "ARTISAN_MANAGER"]);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      fulfillmentStage: stage as "NOT_STARTED" | "PREPARING" | "DISPATCHED" | "DELIVERED",
      trackingNumber: trackingNumber ?? null,
      shipment: {
        upsert: {
          create: {
            carrier: "Custom",
            trackingNumber: trackingNumber ?? null,
          },
          update: {
            trackingNumber: trackingNumber ?? null,
            updatedAt: new Date(),
          },
        },
      },
    },
  });

  revalidatePath("/admin/orders");
}

type OrderWithRelations = Awaited<ReturnType<typeof fetchOrders>>[number];

export default async function AdminOrdersPage() {
  const orders = await fetchOrders();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/90 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Orders & fulfilment</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Review recent sales, update their statuses, and coordinate shipments with artisan partners.
        </p>
      </section>

      <section className="space-y-6">
        {orders.map((order: OrderWithRelations) => (
          <article
            key={order.id}
            className="rounded-3xl border border-[#f6b2c5]/60 bg-white/90 p-6 shadow-sm transition hover:border-[#8a2040]/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">
                  Order #{order.id.slice(-6).toUpperCase()}
                </p>
                <h3 className="text-xl font-semibold text-[#40111f]">
                  {order.user?.name ?? order.email} • {order.user?.email ?? order.email}
                </h3>
                <p className="text-xs text-neutral-500">
                  Placed {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#8a2040]">
                  {formatCurrencyFromCents(order.totalCents)} ({order.currency})
                </p>
                <p className="text-xs text-neutral-500">
                  Subtotal {formatCurrencyFromCents(order.subtotalCents)} · Tax {formatCurrencyFromCents(order.taxCents)} ·
                  Shipping {formatCurrencyFromCents(order.shippingCents)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#f6b2c5]/60 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Status</h4>
                <p className="mt-2 text-sm font-semibold text-[#40111f]">{order.status}</p>
                <form
                  action={async (formData) => {
                    "use server";
                    await updateOrderStatus(
                      order.id,
                      formData.get("status")?.toString() ?? order.status,
                      formData.get("note")?.toString() ?? undefined,
                    );
                  }}
                  className="mt-3 space-y-2 text-xs"
                >
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="w-full rounded-xl border border-[#f6b2c5]/60 bg-white px-3 py-2 text-xs"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="DISPATCHED" disabled>
                      Dispatched (set via fulfilment)
                    </option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Optional note for history"
                    className="w-full rounded-xl border border-[#f6b2c5]/60 bg-white px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full border border-[#f6b2c5]/70 px-4 py-2 text-xs font-semibold text-[#8a2040] hover:border-[#8a2040]"
                  >
                    Update status
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-[#f6b2c5]/60 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Fulfilment</h4>
                <p className="mt-2 text-sm font-semibold text-[#40111f]">{order.fulfillmentStage}</p>
                <form
                  action={async (formData) => {
                    "use server";
                    await updateFulfillmentStage(
                      order.id,
                      formData.get("stage")?.toString() ?? order.fulfillmentStage,
                      formData.get("trackingNumber")?.toString() ?? undefined,
                    );
                  }}
                  className="mt-3 space-y-2 text-xs"
                >
                  <select
                    name="stage"
                    defaultValue={order.fulfillmentStage}
                    className="w-full rounded-xl border border-[#f6b2c5]/60 bg-white px-3 py-2 text-xs"
                  >
                    <option value="NOT_STARTED">Not started</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="DISPATCHED">Dispatched</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                  <input
                    name="trackingNumber"
                    defaultValue={order.trackingNumber ?? ""}
                    placeholder="Tracking number"
                    className="w-full rounded-xl border border-[#f6b2c5]/60 bg-white px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full border border-[#f6b2c5]/70 px-4 py-2 text-xs font-semibold text-[#8a2040] hover:border-[#8a2040]"
                  >
                    Save fulfilment
                  </button>
                </form>
                {order.shipment?.carrier ? (
                  <p className="mt-2 text-xs text-neutral-500">
                    Carrier: {order.shipment.carrier} • Service: {order.shipment.service ?? "Custom"}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-[#f6b2c5]/60 bg-white p-4 text-xs text-neutral-600">
                <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Shipping address</h4>
                {order.shippingAddress ? (
                  <address className="not-italic">
                    <p className="font-semibold text-[#40111f]">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state ?? ""} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone ? <p>Phone: {order.shippingAddress.phone}</p> : null}
                  </address>
                ) : (
                  <p className="text-neutral-400">No shipping address recorded.</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {order.items.map((item: OrderWithRelations["items"][number]) => (
                <div key={item.id} className="rounded-2xl border border-[#f6b2c5]/60 bg-white/70 p-4 text-xs text-neutral-600">
                  <p className="font-semibold text-[#40111f]">{item.product.name}</p>
                  <p>SKU {item.product.sku}</p>
                  <p>
                    Qty {item.quantity} × {formatCurrencyFromCents(item.unitPrice)}
                  </p>
                  <p>Total {formatCurrencyFromCents(item.unitPrice * item.quantity)}</p>
                  {item.product.artisan?.name ? <p>Artisan: {item.product.artisan.name}</p> : null}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#f6b2c5]/50 bg-white/60 p-4 text-xs text-neutral-500">
              <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Recent status history</h4>
              <ul className="mt-2 space-y-1">
                {order.statusHistory.map((entry: OrderWithRelations["statusHistory"][number]) => (
                  <li key={entry.id}>
                    {entry.status} • {new Date(entry.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}{" "}
                    {entry.actorId ? `by ${entry.actorId}` : ""} {entry.note ? `— ${entry.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>

            {order.stripeSessionId ? (
              <div className="mt-4 text-xs text-neutral-500">
                Stripe session: {order.stripeSessionId}{" "}
                <Link href={`https://dashboard.stripe.com/search?query=${order.stripeSessionId}`} className="text-[#8a2040] underline">
                  View in Stripe
                </Link>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

