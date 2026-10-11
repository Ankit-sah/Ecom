import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { authOptions } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

import { walletConfig } from "@/lib/wallet-payments";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/checkout");
  }

  const addresses = await prisma.address.findMany({ where: { userId: session.user.id, saved: true }, orderBy: { createdAt: "desc" } });
  const savedAddresses = addresses.map(a => ({ id: a.id, label: a.label || a.addressLine1, fullName: a.fullName, phone: a.phone || "", addressLine1: a.addressLine1, addressLine2: a.addressLine2 || "", city: a.city, state: a.state || "", postalCode: a.postalCode, country: a.country }));
  return (
    <div className="px-4 py-16">
      <CheckoutPageClient options={walletConfig()} savedAddresses={savedAddresses} />
    </div>
  );
}

