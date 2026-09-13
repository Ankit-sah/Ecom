import { prisma } from "@/lib/prisma";
import { khaltiRequest, walletConfig } from "@/lib/wallet-payments";

// Always query the provider using persisted references and amounts, never callback totals.
export async function verifyWalletOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.paymentReference || !order.paymentAmountPaisa) return false;
  if (["PAID", "FULFILLED"].includes(order.status)) return true;
  if (order.status !== "PENDING") return false;
  let transactionId: string;
  if (order.paymentProvider === "khalti") {
    const result = await khaltiRequest("lookup", { pidx: order.paymentReference });
    if (result.status !== "Completed" || result.refunded || result.pidx !== order.paymentReference || result.total_amount !== order.paymentAmountPaisa || typeof result.transaction_id !== "string") return false;
    transactionId = result.transaction_id;
  } else if (order.paymentProvider === "esewa") {
    const host = walletConfig().sandbox ? "https://rc.esewa.com.np" : "https://esewa.com.np";
    const url = new URL(`${host}/api/epay/transaction/status/`);
    url.search = new URLSearchParams({ product_code: process.env.ESEWA_PRODUCT_CODE!, total_amount: (order.paymentAmountPaisa / 100).toFixed(2), transaction_uuid: order.paymentReference }).toString();
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("eSewa verification unavailable.");
    const result = await response.json();
    if (result.status !== "COMPLETE" || (result.transaction_uuid ?? result.pid) !== order.paymentReference || (result.product_code ?? result.scd) !== process.env.ESEWA_PRODUCT_CODE || Math.round(Number(result.total_amount ?? result.totalAmount) * 100) !== order.paymentAmountPaisa) return false;
    transactionId = result.ref_id ?? result.refId;
    if (typeof transactionId !== "string" || !transactionId) return false;
  } else return false;

  // Atomic status claim + inventory updates: duplicate callbacks cannot deduct twice.
  await prisma.$transaction(async tx => {
    const claimed = await tx.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAID", paymentTransactionId: transactionId } });
    if (!claimed.count) return;
    const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
    const shortages: string[] = [];
    for (const item of items) {
      const updated = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (!updated.count) { shortages.push(item.productId); continue; }
      await tx.productInventoryEvent.create({ data: { productId: item.productId, delta: -item.quantity, reason: `Order ${order.id} paid via ${order.paymentProvider}`, metadata: { orderId: order.id } } });
    }
    await tx.order.update({ where: { id: order.id }, data: {
      fulfillmentStage: shortages.length ? "NOT_STARTED" : "PREPARING",
      ...(shortages.length ? { notes: `Payment received. Inventory review required for: ${shortages.join(", ")}. Do not dispatch until resolved.` } : {}),
      statusHistory: { create: { status: "PAID", note: `${order.paymentProvider} payment verified${shortages.length ? "; inventory review required" : ""}` } },
    } });
  });
  return true;
}
