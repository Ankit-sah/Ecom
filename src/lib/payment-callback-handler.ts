import { paymentCallbackParams } from "@/lib/payment-callback";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentOrigin, verifyEsewaResponse } from "@/lib/wallet-payments";
import { verifyWalletOrder } from "@/lib/verify-wallet-order";

export async function handlePaymentCallback(request: Request, pathOrderId?: string) {
  const params = paymentCallbackParams(request.url, pathOrderId);
  const id = params.get("order_id");
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) return NextResponse.redirect(new URL("/checkout", paymentOrigin()));
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error("Unknown order");
    if (order.paymentProvider === "esewa") {
      const encoded = params.get("data");
      if (!encoded || encoded.length > 8192) throw new Error("Invalid callback");
      const data = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
      if (!data || !verifyEsewaResponse(data) || data.transaction_uuid !== order.paymentReference || data.product_code !== process.env.ESEWA_PRODUCT_CODE || data.status !== "COMPLETE" || Math.round(Number(data.total_amount) * 100) !== order.paymentAmountPaisa) throw new Error("Invalid callback");
    } else if (order.paymentProvider !== "khalti" || params.get("pidx") !== order.paymentReference) throw new Error("Invalid callback");
    await verifyWalletOrder(id);
  } catch (error) {
    console.error("Payment callback verification failed", { orderId: id, error: error instanceof Error ? error.name : "UnknownError" });
    // Keep the order pending for a safe retry when provider verification is unavailable.
  }
  return NextResponse.redirect(new URL(`/checkout/success?order_id=${id}`, paymentOrigin()));
}

