import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { formatCurrencyFromCents } from "@/utils/format";

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (!params.session_id) {
    redirect("/cart");
  }

  // Find order by Stripe session ID
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: params.session_id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    redirect("/cart");
  }

  return (
    <>
      <ClearCartOnSuccess />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
        <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Checkout", href: "/checkout" },
          { label: "Order Confirmation", href: "/checkout/success" },
        ]}
      />

      <div className="space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-[#40111f]">Order Confirmed!</h1>
          <p className="text-neutral-600">
            Thank you for your purchase. We&apos;ve received your order and will begin processing it shortly.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-[#f6b2c5]/50 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#b03d5e]">Order Number</p>
            <p className="mt-1 text-lg font-semibold text-[#40111f]">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#b03d5e]">Order Total</p>
            <p className="mt-1 text-lg font-semibold text-[#8a2040]">{formatCurrencyFromCents(order.totalCents)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#40111f]">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-lg border border-[#f6b2c5]/50 p-4">
                {item.product.images.length > 0 && (
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </Link>
                )}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold text-[#40111f] hover:text-[#8a2040] hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#8a2040]">
                    {formatCurrencyFromCents(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.shippingAddress && (
          <div className="mt-6 space-y-2 border-t border-[#f6b2c5]/50 pt-6">
            <h2 className="text-lg font-semibold text-[#40111f]">Shipping Address</h2>
            <p className="text-sm text-neutral-700">
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

        <div className="mt-6 space-y-2 border-t border-[#f6b2c5]/50 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-medium text-[#40111f]">{formatCurrencyFromCents(order.subtotalCents)}</span>
          </div>
          {order.taxCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Tax</span>
              <span className="font-medium text-[#40111f]">{formatCurrencyFromCents(order.taxCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Shipping</span>
            <span className="font-medium text-[#40111f]">{formatCurrencyFromCents(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between border-t border-[#f6b2c5]/50 pt-2 text-base font-semibold">
            <span className="text-[#40111f]">Total</span>
            <span className="text-[#8a2040]">{formatCurrencyFromCents(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="rounded-full bg-[#8a2040] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
        >
          View Order History
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-[#8a2040]/40 px-6 py-3 text-center text-sm font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="rounded-3xl border border-[#8a2040]/50 bg-[#8a2040] p-8 text-white">
        <h2 className="text-xl font-semibold">What&apos;s Next?</h2>
        <ul className="mt-4 space-y-2 text-sm text-rose-100">
          <li>• You&apos;ll receive an order confirmation email shortly</li>
          <li>• We&apos;ll notify you when your order ships with tracking information</li>
          <li>• Estimated delivery: {order.shippingAddress?.country === "NP" ? "3-7 business days" : "7-21 business days"}</li>
          <li>• Questions? <Link href="/contact" className="font-semibold underline hover:text-white">Contact us</Link></li>
        </ul>
      </div>
    </div>
    </>
  );
}

