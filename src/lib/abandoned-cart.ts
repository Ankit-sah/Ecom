import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * Save abandoned cart
 */
export async function saveAbandonedCart(
  email: string,
  userId: string | null,
  sessionId: string | null,
  items: Array<{ productId: string; quantity: number; priceCents: number }>,
  totalCents: number
) {
  try {
    // Find existing cart
    const existing = await prisma.abandonedCart.findFirst({
      where: userId
        ? { userId }
        : sessionId
          ? { sessionId }
          : { email },
    });

    if (existing) {
      await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: {
          email,
          items: items as any,
          totalCents,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.abandonedCart.create({
        data: {
          email,
          userId: userId || null,
          sessionId: sessionId || null,
          items: items as any,
          totalCents,
          emailed: false,
          recovered: false,
        },
      });
    }
  } catch (error) {
    console.error("Failed to save abandoned cart:", error);
  }
}

/**
 * Send abandoned cart reminder email
 */
export async function sendAbandonedCartEmail(cartId: string) {
  const cart = await prisma.abandonedCart.findUnique({
    where: { id: cartId },
  });

  if (!cart || cart.emailed) {
    return false;
  }

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const items = cart.items as Array<{
    productId: string;
    quantity: number;
    priceCents: number;
    productName?: string;
  }>;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0;">${item.productName || "Product"}</td>
      <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 0; text-align: right;">${currencyFormatter.format(item.priceCents / 100)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to bottom right, #fff7ec, #ffe8c5, #ffd1e3); padding: 30px; border-radius: 12px;">
          <h1 style="color: #F97316; margin-top: 0;">You left items in your cart!</h1>
          <p>We noticed you didn't complete your purchase. Your items are still waiting for you!</p>
          
          <h2 style="color: #1F2937; margin-top: 30px;">Your Cart</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #FED7AA;">
                <th style="text-align: left; padding: 8px 0;">Item</th>
                <th style="text-align: center; padding: 8px 0;">Quantity</th>
                <th style="text-align: right; padding: 8px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/cart" style="display: inline-block; background: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold;">
              Complete Your Purchase
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Janakpur Art and Craft<br>
            Handcrafted Mithila Artistry Since 1993
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
You left items in your cart!

We noticed you didn't complete your purchase. Your items are still waiting for you!

Complete your purchase: ${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/cart

Janakpur Art and Craft
Handcrafted Mithila Artistry Since 1993
  `;

  const sent = await sendEmail({
    to: cart.email,
    subject: "Complete Your Purchase - Items Waiting in Your Cart",
    html,
    text,
  });

  if (sent) {
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: { emailed: true },
    });
  }

  return sent;
}


