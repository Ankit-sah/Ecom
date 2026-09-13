import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutError, checkoutTotals, validateCheckout } from "@/lib/checkout-validation";
import { esewaSignature, khaltiRequest, paymentOrigin, toPaisa, walletConfig } from "@/lib/wallet-payments";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: "Please sign in to checkout." }, { status: 401 });
  try {
    const body = await request.json();
    const provider: unknown = body?.provider;
    const config = walletConfig();
    if ((provider !== "esewa" && provider !== "khalti") || !config[provider] || !config.rate) return NextResponse.json({ error: "This payment method is currently unavailable." }, { status: 503 });
    if (body.exchangeRate !== config.rate) throw new CheckoutError("The conversion rate changed. Refresh checkout to see the updated total.");
    const { items, shippingAddress, shippingMethod } = validateCheckout(body);
    const products = await prisma.product.findMany({ where: { id: { in: items.map(item => item.productId) }, published: true } });
    const orderItems = items.map(item => {
      const product = products.find(product => product.id === item.productId);
      if (!product || product.stock < item.quantity) throw new CheckoutError("An item is unavailable. Please review your cart.");
      return { ...item, unitPrice: product.priceCents };
    });
    const totals = checkoutTotals(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), shippingMethod);
    const amount = toPaisa(totals.totalCents, config.rate);
    // Require explicit acceptance of the exact server-calculated amount.
    if (body.expectedAmountPaisa !== amount) throw new CheckoutError("Your order total changed. Refresh your cart before paying.");
    const origin = paymentOrigin();
    const reference = randomUUID();
    const order = await prisma.order.create({ data: {
      email: session.user.email, user: { connect: { id: session.user.id } }, ...totals,
      paymentProvider: provider, paymentReference: reference, paymentAmountPaisa: amount, paymentExchangeRate: config.rate,
      shippingAddress: { create: { ...shippingAddress, userId: session.user.id, label: "Shipping" } },
      items: { create: orderItems },
      statusHistory: { create: { status: "PENDING", note: `${provider} checkout initiated`, actorId: session.user.email } },
      shipment: { create: { service: shippingMethod, carrier: shippingMethod === "domestic" ? "Domestic Courier" : "International Express" } },
    } });
    const callback = `${origin}/api/payments/verify/${order.id}`;
    if (provider === "esewa") {
      const fields: Record<string, string> = {
        amount: (amount / 100).toFixed(2), tax_amount: "0", total_amount: (amount / 100).toFixed(2),
        transaction_uuid: reference, product_code: process.env.ESEWA_PRODUCT_CODE!,
        product_service_charge: "0", product_delivery_charge: "0",
        success_url: callback, failure_url: `${origin}/checkout/success?order_id=${order.id}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
      };
      fields.signature = esewaSignature(`total_amount=${fields.total_amount},transaction_uuid=${reference},product_code=${fields.product_code}`);
      return NextResponse.json({ action: config.sandbox ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form" : "https://epay.esewa.com.np/api/epay/main/v2/form", fields }, { status: 201 });
    }
    const result = await khaltiRequest("initiate", {
      return_url: callback, website_url: origin, amount, purchase_order_id: order.id,
      purchase_order_name: `Janakpur Art order ${order.id.slice(-8)}`,
      customer_info: { name: shippingAddress.fullName, email: session.user.email },
    });
    if (typeof result.pidx !== "string" || typeof result.payment_url !== "string") throw new Error("Invalid payment response.");
    const paymentUrl = new URL(result.payment_url);
    if (paymentUrl.protocol !== "https:" || !["pay.khalti.com", "dev.khalti.com", "test-pay.khalti.com"].includes(paymentUrl.hostname)) throw new Error("Invalid payment destination.");
    await prisma.order.update({ where: { id: order.id }, data: { paymentReference: result.pidx } });
    return NextResponse.json({ url: result.payment_url }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Wallet checkout could not be initiated", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Unable to start payment. Please try again shortly." }, { status: 502 });
  }
}
