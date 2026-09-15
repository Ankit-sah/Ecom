import { handlePaymentCallback } from "@/lib/payment-callback-handler";

export const maxDuration = 30;

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params;
  return handlePaymentCallback(request, orderId);
}
