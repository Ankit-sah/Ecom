import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { deductStockFromOrder, restoreStockFromOrder } from "@/lib/inventory";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured in environment variables");
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
          include: { 
            statusHistory: true,
            shippingAddress: true,
          },
        });

        if (!order) {
          console.warn(`Order not found for Stripe session: ${stripeSessionId}`);
        }
        
        if (order && order.status !== "PAID") {
          // Deduct stock from products
          try {
            await deductStockFromOrder(order.id);
          } catch (error) {
            console.error(`Failed to deduct stock for order ${order.id}:`, error);
            // If stock deduction fails, mark order with a note but still mark as paid
            // Admin will need to handle this manually
            await prisma.order.update({
              where: { id: order.id },
              data: {
                notes: `WARNING: Stock deduction failed - ${error instanceof Error ? error.message : "Unknown error"}. Manual intervention required.`,
              },
            });
          }

          const updatedOrder = await prisma.order.update({
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
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });

          // Send order confirmation email
          try {
            const emailSent = await sendOrderConfirmationEmail(
              order.email,
              order.id,
              order.totalCents,
              updatedOrder.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.unitPrice * item.quantity,
              })),
              order.shippingAddress ? {
                fullName: order.shippingAddress.fullName,
                addressLine1: order.shippingAddress.addressLine1,
                addressLine2: order.shippingAddress.addressLine2,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                postalCode: order.shippingAddress.postalCode,
                country: order.shippingAddress.country,
              } : null
            );
            
            if (!emailSent) {
              console.warn(`Order confirmation email was not sent for order ${order.id} (email may be disabled)`);
            }
          } catch (error) {
            console.error(`Failed to send order confirmation email for order ${order.id}:`, error);
            // Don't fail the webhook if email fails
          }
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
          // If order was already paid but payment failed later, restore stock
          if (order.status === "PAID") {
            try {
              await restoreStockFromOrder(order.id);
            } catch (error) {
              console.error(`Failed to restore stock for order ${order.id}:`, error);
            }
          }

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
      case "charge.refunded": {
        // Handle refunds - restore stock if needed
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === "string" 
          ? charge.payment_intent 
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          const order = await prisma.order.findFirst({
            where: { stripePaymentId: paymentIntentId },
          });

          if (order && order.status === "PAID") {
            try {
              await restoreStockFromOrder(order.id);
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: "REFUNDED",
                  statusHistory: {
                    create: {
                      status: "REFUNDED",
                      note: "Payment refunded via Stripe",
                    },
                  },
                },
              });
            } catch (error) {
              console.error(`Failed to process refund for order ${order.id}:`, error);
            }
          }
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

