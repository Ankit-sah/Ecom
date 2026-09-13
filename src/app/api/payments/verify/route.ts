import { handlePaymentCallback } from "@/lib/payment-callback-handler";

export async function GET(request: Request) {
  return handlePaymentCallback(request);
}
