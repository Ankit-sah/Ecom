import { redirect } from "next/navigation";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { getCurrentSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { createTicket } from "@/lib/customer-actions";
import { SupportTickets } from "@/components/support-tickets";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/auth/sign-in?callbackUrl=/account/support");
  const [orders, tickets, query] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <Link href="/account">← Account</Link>
      <h1 className="text-3xl font-semibold">Support requests</h1>
      <ActionForm
        action={createTicket}
        resetOnSuccess
        className="space-y-4 rounded-2xl border bg-white p-6"
      >
        <label className="block">
          Order
          <select
            name="orderId"
            defaultValue={orders.some((order) => order.id === query.order) ? query.order : ""}
            className="block w-full rounded border p-2"
          >
            <option value="">General question</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                Order #{order.id.slice(-8)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          Subject
          <input name="subject" required maxLength={120} className="block w-full rounded border p-2" />
        </label>
        <label className="block">
          Message
          <textarea name="message" required maxLength={4000} className="block w-full rounded border p-2" />
        </label>
        <button className="rounded bg-[#31554d] px-4 py-2 text-white disabled:opacity-60">
          Create support request
        </button>
      </ActionForm>
      <SupportTickets tickets={tickets} />
    </div>
  );
}
