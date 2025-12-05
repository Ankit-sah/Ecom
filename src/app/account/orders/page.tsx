import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatCurrencyFromCents } from "@/utils/format";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
  };
};

type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
};

type Order = {
  id: string;
  status: string;
  fulfillmentStage: string | null;
  totalCents: number;
  trackingNumber: string | null;
  createdAt: Date;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
};

async function getOrders(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    fulfillmentStage: order.fulfillmentStage,
    totalCents: order.totalCents,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        priceCents: item.product.priceCents,
      },
    })),
    shippingAddress: order.shippingAddress
      ? {
          fullName: order.shippingAddress.fullName,
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        }
      : null,
  }));
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/account/orders");
  }

  const orders = await getOrders(session.user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Order History</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">My Orders</h1>
        </div>
      </section>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#8a2040]/40 bg-white/70 p-16 text-center">
          <p className="text-sm text-neutral-600 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-[#40111f]">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CANCELLED" || order.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-sm text-neutral-600">
                      Tracking: <span className="font-medium text-[#8a2040]">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-[#8a2040]">
                    {formatCurrencyFromCents(order.totalCents)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t border-[#f6b2c5]/50 pt-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-neutral-700 hover:text-[#8a2040] hover:underline"
                        >
                          {item.product.name} × {item.quantity}
                        </Link>
                        <span className="text-neutral-600">
                          {formatCurrencyFromCents(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.shippingAddress && (
                <div className="mt-4 border-t border-[#f6b2c5]/50 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#b03d5e]">Shipping Address</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    {order.shippingAddress.fullName}
                    <br />
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && (
                      <>
                        <br />
                        {order.shippingAddress.addressLine2}
                      </>
                    )}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

