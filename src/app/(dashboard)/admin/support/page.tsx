import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { SupportTickets } from "@/components/support-tickets";

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireRole(["ADMIN", "STAFF"]);
  const query = await searchParams;
  const status = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(query.status ?? "") ? query.status! : "ALL";
  const page = Math.min(10000, Math.max(1, Math.floor(Number(query.page) || 1)));
  const where: Prisma.SupportTicketWhereInput = status === "ALL" ? {} : { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" };
  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({ where, include: { messages: { orderBy: { createdAt: "asc" } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (page - 1) * 25, take: 25 }),
    prisma.supportTicket.count({ where }),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Customer support</h1>
      <p>Replies and status changes are visible to the customer.</p>
      <nav aria-label="Ticket status" className="flex flex-wrap gap-4">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(value => <Link key={value} href={`?status=${value}`} aria-current={status === value ? "page" : undefined} className={status === value ? "font-semibold underline" : ""}>{value.replaceAll("_", " ")}</Link>)}
      </nav>
      <SupportTickets tickets={tickets} staff/>
      <nav aria-label="Ticket pages" className="flex gap-4">
        {page > 1 && <Link href={`?status=${status}&page=${page - 1}`}>Previous</Link>}
        <span>Page {page} · {total} requests</span>
        {page * 25 < total && <Link href={`?status=${status}&page=${page + 1}`}>Next</Link>}
      </nav>
    </div>
  );
}
