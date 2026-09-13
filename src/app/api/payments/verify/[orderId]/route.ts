import { handlePaymentCallback } from "@/lib/payment-callback-handler";

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params;
  return handlePaymentCallback(request, orderId);
}
