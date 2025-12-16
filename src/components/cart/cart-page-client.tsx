"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/providers/cart-provider";
import { formatCurrencyFromCents } from "@/utils/format";

export function CartPageClient() {
  const { items, subtotalCents, totalQuantity, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-dashed border-orange-500/40 bg-white/75 p-16 text-center">
        <p className="text-2xl font-semibold text-gray-800">Your cart is empty</p>
        <p className="text-sm text-neutral-600">
          Browse the Mithila collection and add handcrafted treasures to your cart.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-[orange-500] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[orange-500]/30 transition hover:bg-orange-600"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">Your Mithila cart</h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-semibold text-orange-600 underline-offset-4 transition hover:text-orange-500 hover:underline"
          >
            Clear cart
          </button>
        </div>
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.product.id}
              className="flex flex-col gap-4 rounded-3xl border border-orange-200/70 bg-white/85 p-5 shadow-sm md:flex-row md:items-center md:gap-6"
            >
              <div className="relative aspect-square h-28 w-28 overflow-hidden rounded-2xl border border-orange-200/70 bg-[#fff4f9]">
                {item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">No image</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-lg font-semibold text-gray-800 transition hover:text-orange-500"
                  >
                    {item.product.name}
                  </Link>
                  <span className="text-sm font-semibold text-orange-500">
                    {formatCurrencyFromCents(item.product.priceCents)}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-orange-600">
                  {item.product.category?.name ?? "Mithila Craft"}
                </p>
                {item.product.stock < item.quantity && (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-2">
                    <p className="text-xs font-semibold text-orange-700">
                      ⚠️ Only {item.product.stock} available. Quantity adjusted.
                    </p>
                  </div>
                )}
                {item.product.stock === 0 && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                    <p className="text-xs font-semibold text-red-700">
                      ⚠️ This item is out of stock and will be removed.
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-full border border-orange-500/40">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-10 w-10 rounded-l-full text-lg font-semibold text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="min-w-[3rem] text-center text-sm font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="h-10 w-10 rounded-r-full text-lg font-semibold text-orange-500 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:text-neutral-400"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="text-sm font-semibold text-orange-600 underline-offset-4 transition hover:text-orange-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6 rounded-3xl border border-orange-200/70 bg-white/85 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Order summary</h2>
          <p className="text-sm text-neutral-600">Items in cart: {totalQuantity}</p>
        </div>
        <dl className="space-y-3 text-sm text-neutral-700">
          <div className="flex items-center justify-between">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-orange-500">{formatCurrencyFromCents(subtotalCents)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Tax</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="block rounded-full bg-[orange-500] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[orange-500]/30 transition hover:bg-orange-600"
        >
          Proceed to checkout
        </Link>
        <p className="text-xs text-neutral-500">
          Need help?{" "}
          <a href="#" className="font-semibold text-orange-500 underline-offset-2 hover:underline">
            Contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}

