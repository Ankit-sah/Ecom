/**
 * Email notification utility
 * Supports Resend, SendGrid, or can be extended for other providers
 */

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Send email notification
 * Currently a placeholder - implement with your preferred email service
 * Options: Resend, SendGrid, AWS SES, etc.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Check if email is enabled
  const emailEnabled = process.env.EMAIL_ENABLED === "true";
  const emailProvider = process.env.EMAIL_PROVIDER || "none";

  if (!emailEnabled || emailProvider === "none") {
    console.log("Email notifications disabled. Would send:", options);
    return false;
  }

  try {
    // Resend implementation example
    if (emailProvider === "resend" && process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "noreply@janakpurartandcraft.com",
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Failed to send email via Resend:", error);
        return false;
      }

      return true;
    }

    // Add other email providers here (SendGrid, AWS SES, etc.)
    console.warn(`Email provider "${emailProvider}" not implemented`);
    return false;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  orderTotal: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<boolean> {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0;">${item.name}</td>
      <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 0; text-align: right;">${currencyFormatter.format(item.price / 100)}</td>
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
          <h1 style="color: #8a2040; margin-top: 0;">Order Confirmation</h1>
          <p>Thank you for your purchase from Janakpur Art and Craft!</p>
          <p><strong>Order Number:</strong> #${orderId.slice(-8).toUpperCase()}</p>
          <p><strong>Total:</strong> ${currencyFormatter.format(orderTotal / 100)}</p>
          
          <h2 style="color: #40111f; margin-top: 30px;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #f6b2c5;">
                <th style="text-align: left; padding: 8px 0;">Item</th>
                <th style="text-align: center; padding: 8px 0;">Quantity</th>
                <th style="text-align: right; padding: 8px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="margin-top: 30px;">We'll send you another email when your order ships with tracking information.</p>
          <p>If you have any questions, please <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/contact" style="color: #8a2040;">contact us</a>.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Janakpur Art and Craft<br>
            Handcrafted Mithila Artistry Since 1993
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Order Confirmation

Thank you for your purchase from Janakpur Art and Craft!

Order Number: #${orderId.slice(-8).toUpperCase()}
Total: ${currencyFormatter.format(orderTotal / 100)}

Order Items:
${items.map((item) => `- ${item.name} x${item.quantity} - ${currencyFormatter.format(item.price / 100)}`).join("\n")}

We'll send you another email when your order ships with tracking information.

If you have any questions, please contact us at ${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/contact

Janakpur Art and Craft
Handcrafted Mithila Artistry Since 1993
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmation - #${orderId.slice(-8).toUpperCase()}`,
    html,
    text,
  });
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotificationEmail(
  email: string,
  orderId: string,
  trackingNumber: string | null
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to bottom right, #fff7ec, #ffe8c5, #ffd1e3); padding: 30px; border-radius: 12px;">
          <h1 style="color: #8a2040; margin-top: 0;">Your Order Has Shipped!</h1>
          <p>Great news! Your order from Janakpur Art and Craft has been shipped.</p>
          <p><strong>Order Number:</strong> #${orderId.slice(-8).toUpperCase()}</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
          <p>You can track your order and view order details in your <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/account/orders" style="color: #8a2040;">account</a>.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Janakpur Art and Craft<br>
            Handcrafted Mithila Artistry Since 1993
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Your Order Has Shipped!

Great news! Your order from Janakpur Art and Craft has been shipped.

Order Number: #${orderId.slice(-8).toUpperCase()}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ""}

You can track your order and view order details in your account: ${process.env.NEXT_PUBLIC_APP_URL || "https://ecom-one-sandy.vercel.app"}/account/orders

Janakpur Art and Craft
Handcrafted Mithila Artistry Since 1993
  `;

  return sendEmail({
    to: email,
    subject: `Your Order Has Shipped - #${orderId.slice(-8).toUpperCase()}`,
    html,
    text,
  });
}

