import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature ?? "", webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSessionId = session.id;
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

        const order = await prisma.order.findUnique({
          where: { stripeSessionId },
          include: { statusHistory: true },
        });

        if (order && order.status !== "PAID") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              stripePaymentId: paymentIntentId,
              fulfillmentStage: "PREPARING",
              statusHistory: {
                create: {
                  status: "PAID",
                  note: "Stripe checkout completed",
                },
              },
            },
          });
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const order = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
        });
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: event.type === "checkout.session.expired" ? "CANCELLED" : "FAILED",
              statusHistory: {
                create: {
                  status: event.type === "checkout.session.expired" ? "CANCELLED" : "FAILED",
                  note: event.type === "checkout.session.expired" ? "Checkout session expired" : "Payment failed",
                },
              },
            },
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to handle Stripe webhook:", error);
    return NextResponse.json({ error: "Webhook handling error." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

