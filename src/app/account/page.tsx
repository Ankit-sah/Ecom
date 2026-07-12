import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { AccountPageClient } from "@/app/account/page-client";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null; // Will be handled by client component
  }

  return <AccountPageClient />;
}

