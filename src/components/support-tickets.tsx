import { ActionForm } from "@/components/action-form";
import { replyTicket } from "@/lib/customer-actions";
import type { SupportTicket, SupportMessage } from "@prisma/client";

export function SupportTickets({
  tickets,
  staff = false,
}: {
  tickets: (SupportTicket & { messages: SupportMessage[] })[];
  staff?: boolean;
}) {
  return (
    <div className="space-y-6">
      {!tickets.length && <p>No support requests yet.</p>}
      {tickets.map((ticket) => (
        <article key={ticket.id} className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">{ticket.subject}</h2>
          <p className="mt-2 text-sm">
            Ticket #{ticket.id.slice(-8)} · {ticket.status.replaceAll("_", " ")}
            {ticket.orderId ? ` · Order #${ticket.orderId.slice(-8)}` : ""}
          </p>
          <ol className="my-4 space-y-3">
            {ticket.messages.map((message) => (
              <li key={message.id} className="rounded bg-[#fbf6ed] p-3">
                <p className="text-xs font-semibold">
                  {message.fromStaff ? "Support team" : "Customer"} ·{" "}
                  {message.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Kathmandu" })}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
              </li>
            ))}
          </ol>
          <ActionForm
            action={replyTicket.bind(null, ticket.id)}
            resetOnSuccess
            className="space-y-3"
          >
            <label className="block">
              Reply
              <textarea
                name="message"
                required={!staff}
                maxLength={4000}
                className="block w-full rounded border p-2"
              />
            </label>
            {staff ? (
              <div>
                <label htmlFor={`ticket-status-${ticket.id}`}>Status</label>
                <select
                  key={ticket.status}
                  id={`ticket-status-${ticket.id}`}
                  name="status"
                  defaultValue={ticket.status}
                  className="ml-2 rounded border p-2"
                >
                  {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            ) : (
              <input type="hidden" name="status" value="" />
            )}
            <button className="rounded bg-[#31554d] px-4 py-2 text-white disabled:opacity-60">
              {staff ? "Update ticket" : "Send reply"}
            </button>
          </ActionForm>
        </article>
      ))}
    </div>
  );
}
