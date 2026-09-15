import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { checkoutTotals, CheckoutError, validateCheckout } from "@/lib/checkout-validation";
import { validateOrderStock } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
      shipment: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  type OrderWithRelations = (typeof orders)[number];
  
  return NextResponse.json({
    orders: orders.map((order: OrderWithRelations) => ({
      id: order.id,
      email: order.email,
      status: order.status,
       fulfillmentStage: order.fulfillmentStage,
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
       shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      stripeSessionId: order.stripeSessionId,
       trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress
        ? {
            fullName: order.shippingAddress.fullName,
            phone: order.shippingAddress.phone,
            addressLine1: order.shippingAddress.addressLine1,
            addressLine2: order.shippingAddress.addressLine2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
          }
        : null,
      billingAddress: order.billingAddress
        ? {
            fullName: order.billingAddress.fullName,
            phone: order.billingAddress.phone,
            addressLine1: order.billingAddress.addressLine1,
            addressLine2: order.billingAddress.addressLine2,
            city: order.billingAddress.city,
            state: order.billingAddress.state,
            postalCode: order.billingAddress.postalCode,
            country: order.billingAddress.country,
          }
        : null,
      statusHistory: order.statusHistory.map((entry: OrderWithRelations["statusHistory"][number]) => ({
        id: entry.id,
        status: entry.status,
        note: entry.note,
        createdAt: entry.createdAt,
      })),
      items: order.items.map((item: OrderWithRelations["items"][number]) => ({
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
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = validateCheckout(await request.json());

    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== body.items.length) {
      return NextResponse.json({ error: "Some products could not be found." }, { status: 400 });
    }

    const stockValidation = await validateOrderStock(body.items);
    if (!stockValidation.valid) return NextResponse.json({ error: "An item is no longer available.", details: stockValidation.errors }, { status: 400 });

    const items = body.items.map((item) => {
      const product = products.find((p: { id: string }) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      return {
        product,
        quantity: item.quantity,
      };
    });

    const subtotalCents = items.reduce((total, item) => total + item.quantity * item.product.priceCents, 0);
    const { taxCents, shippingCents, totalCents } = checkoutTotals(subtotalCents, body.shippingMethod);

    const shippingAddress = await prisma.address.create({ data: { label: "Shipping", ...body.shippingAddress, userId: session.user.id } });
    const shippingAddressId = shippingAddress.id;

    const order = await prisma.order.create({
      data: {
        email: session.user.email,
        userId: session.user.id,
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        shippingAddressId,
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.product.priceCents,
            productId: item.product.id,
          })),
        },
        statusHistory: {
          create: {
            status: "PENDING",
            actorId: session.user.email,
            note: "Order created via validated API request",
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    return NextResponse.json(
      {
        order: {
          ...order,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          items: order.items.map((item: typeof order.items[number]) => ({
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
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CheckoutError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Failed to create order", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
