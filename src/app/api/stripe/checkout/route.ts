import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateOrderStock } from "@/lib/inventory";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey != null ? new Stripe(stripeSecretKey) : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe secret key is not configured." }, { status: 500 });
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      items?: Array<{
        productId: string;
        quantity: number;
      }>;
      shippingMethod?: "domestic" | "international";
      shippingCents?: number;
      shippingAddress?: {
        fullName: string;
        phone?: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country?: string;
      };
    };

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "At least one item is required." }, { status: 400 });
    }

    if (!body.shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
    }

    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== body.items.length) {
      return NextResponse.json({ error: "Some products could not be found." }, { status: 400 });
    }

    // Validate stock availability before creating checkout session
    const stockValidation = await validateOrderStock(body.items);
    if (!stockValidation.valid) {
      return NextResponse.json(
        {
          error: "Stock validation failed",
          details: stockValidation.errors,
        },
        { status: 400 }
      );
    }

    const itemsWithProduct = body.items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p: { id: string }) => p.id === item.productId);
      if (!product) {
        throw new Error(`Missing product ${item.productId}`);
      }

      const quantity = Math.max(1, item.quantity);

      return {
        product,
        quantity,
      };
    });

    const lineItems = itemsWithProduct.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description ?? undefined,
          metadata: {
            productId: item.product.id,
          },
        },
        unit_amount: item.product.priceCents,
      },
      quantity: item.quantity,
    }));

    const subtotalCents = itemsWithProduct.reduce((total, item) => total + item.quantity * item.product.priceCents, 0);
    const taxCents = Math.round(subtotalCents * 0.08);
    const shippingMethod = body.shippingMethod ?? "domestic";
    const computedShippingCents =
      body.shippingCents ??
      (shippingMethod === "domestic"
        ? Math.max(800, Math.round(subtotalCents * 0.05))
        : Math.max(2500, Math.round(subtotalCents * 0.12)));
    const totalCents = subtotalCents + taxCents + computedShippingCents;

    const shippingLineItem = {
      price_data: {
        currency: "usd",
        product_data: {
          name: shippingMethod === "domestic" ? "Domestic courier" : "International express shipping",
          description:
            shippingMethod === "domestic"
              ? "Dispatched from Kathmandu fulfilment hub (3–5 business days)."
              : "Insured DHL/FedEx shipment (5–10 business days).",
          metadata: {
            productId: "shipping",
            type: "shipping",
            shippingMethod,
          },
        },
        unit_amount: computedShippingCents,
      },
      quantity: 1,
    };

    lineItems.push(shippingLineItem);

    const shippingAddressRecord = await prisma.address.create({
      data: {
        label: "Shipping",
        fullName: body.shippingAddress.fullName,
        phone: body.shippingAddress.phone,
        addressLine1: body.shippingAddress.addressLine1,
        addressLine2: body.shippingAddress.addressLine2,
        city: body.shippingAddress.city,
        state: body.shippingAddress.state,
        postalCode: body.shippingAddress.postalCode,
        country: body.shippingAddress.country ?? "NP",
        userId: session.user.id,
      },
    });

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId: session.user.id,
        shipping_method: shippingMethod,
        orderId: "", // Will be set after order creation
      },
    });

    const order = await prisma.order.create({
      data: {
        email: session.user.email,
        userId: session.user.id,
        subtotalCents,
        taxCents,
        shippingCents: computedShippingCents,
        totalCents,
        stripeSessionId: checkoutSession.id,
        shippingAddressId: shippingAddressRecord.id,
        items: {
          create: itemsWithProduct.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.product.priceCents,
            productId: item.product.id,
          })),
        },
        statusHistory: {
          create: {
            status: "PENDING",
            actorId: session.user.email,
            note: "Order created via Stripe checkout",
          },
        },
        shipment: {
          create: {
            carrier: shippingMethod === "domestic" ? "Domestic Courier" : "International Express",
            service: shippingMethod,
          },
        },
      },
    });

    // Update Stripe session metadata with order ID
    await stripe.checkout.sessions.update(checkoutSession.id, {
      metadata: {
        ...checkoutSession.metadata,
        orderId: order.id,
      },
    });

    return NextResponse.json(
      {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        orderId: order.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("stock") || error.message.includes("Stock")) {
        return NextResponse.json(
          { 
            error: "Stock validation failed",
            details: error.message,
          },
          { status: 400 }
        );
      }
      if (error.message.includes("product") || error.message.includes("Product")) {
        return NextResponse.json(
          { 
            error: "Product validation failed",
            details: error.message,
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create checkout session.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

