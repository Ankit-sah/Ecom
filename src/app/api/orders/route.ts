import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
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
    const body = (await request.json()) as {
      items?: Array<{
        productId: string;
        quantity: number;
      }>;
      stripeSessionId?: string;
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
      } | null;
      billingAddress?: {
        fullName: string;
        phone?: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country?: string;
      } | null;
    };

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Order items are required." }, { status: 400 });
    }

    const productIds = body.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== body.items.length) {
      return NextResponse.json({ error: "Some products could not be found." }, { status: 400 });
    }

    const items = body.items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p: { id: string }) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      return {
        product,
        quantity: Math.max(1, item.quantity),
      };
    });

    const subtotalCents = items.reduce((total, item) => total + item.quantity * item.product.priceCents, 0);
    const taxCents = Math.round(subtotalCents * 0.08);
    const shippingCents = typeof body.shippingCents === "number" ? body.shippingCents : Math.round(subtotalCents * 0.05);
    const totalCents = subtotalCents + taxCents + shippingCents;

    let shippingAddressId: string | undefined;
    if (body.shippingAddress) {
      const shippingAddress = await prisma.address.create({
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
      shippingAddressId = shippingAddress.id;
    }

    let billingAddressId: string | undefined;
    if (body.billingAddress) {
      const billingAddress = await prisma.address.create({
        data: {
          label: "Billing",
          fullName: body.billingAddress.fullName,
          phone: body.billingAddress.phone,
          addressLine1: body.billingAddress.addressLine1,
          addressLine2: body.billingAddress.addressLine2,
          city: body.billingAddress.city,
          state: body.billingAddress.state,
          postalCode: body.billingAddress.postalCode,
          country: body.billingAddress.country ?? "NP",
          userId: session.user.id,
        },
      });
      billingAddressId = billingAddress.id;
    }

    const order = await prisma.order.create({
      data: {
        email: session.user.email,
        userId: session.user.id,
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        stripeSessionId: body.stripeSessionId,
        shippingAddressId,
        billingAddressId,
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
            note: "Order created via API",
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
    console.error("Failed to create order", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}

