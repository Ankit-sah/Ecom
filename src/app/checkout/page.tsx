import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in?callbackUrl=/checkout");
  }

  return (
    <div className="px-4 py-16">
      <CheckoutPageClient />
    </div>
  );
}

