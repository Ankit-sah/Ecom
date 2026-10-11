import Link from "next/link";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { ActionForm, type FormActionResult } from "@/components/action-form";

async function moderate(id: string, version: string, data: FormData): Promise<FormActionResult> {
  "use server";
  const session = await requireRole(["ADMIN", "STAFF"]);
  const status = data.get("status");
  if (status !== "APPROVED" && status !== "REJECTED") return { error: "Choose approve or reject." };
  // A staff decision applies only to the exact text displayed in the queue.
  const result = await prisma.productReview.updateMany({
    where: { id, updatedAt: new Date(version) },
    data: { status, moderatedBy: session.user?.id, moderatedAt: new Date() },
  });
  if (!result.count) return { error: "This review has changed. Refresh the page and review the latest text before deciding." };
  const review = await prisma.productReview.findUnique({ where: { id }, select: { product: { select: { slug: true } } } });
  revalidatePath("/admin/reviews");
  if (review) revalidatePath(`/products/${review.product.slug}`);
  return { success: status === "APPROVED" ? "Review approved." : "Review rejected." };
}

export default async function ReviewModerationPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireRole(["ADMIN", "STAFF"]);
  const query = await searchParams;
  const status = ["PENDING", "APPROVED", "REJECTED"].includes(query.status ?? "") ? query.status! : "ALL";
  const page = Math.min(10000, Math.max(1, Math.floor(Number(query.page) || 1)));
  const where: Prisma.ProductReviewWhereInput = status === "ALL" ? {} : { status: status as "PENDING" | "APPROVED" | "REJECTED" };
  const [reviews, total] = await Promise.all([
    prisma.productReview.findMany({ where, include: { product: { select: { name: true } }, user: { select: { name: true } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (page - 1) * 25, take: 25 }),
    prisma.productReview.count({ where }),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Review moderation</h1>
      <p>Only approved reviews appear publicly. Editing a review sends it back for approval.</p>
      <nav aria-label="Review status" className="flex flex-wrap gap-4">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map(value => <Link key={value} href={`?status=${value}`} aria-current={status === value ? "page" : undefined} className={status === value ? "font-semibold underline" : ""}>{value}</Link>)}
      </nav>
      {!reviews.length && <p>No reviews in this queue.</p>}
      {reviews.map(review => (
        <article key={review.id} className="space-y-3 rounded-2xl border bg-white p-6">
          <p>{review.product.name} · {review.user.name || "Customer"} · {review.rating}/5 · {review.status}</p>
          <h2 className="font-semibold">{review.title}</h2>
          <p className="whitespace-pre-wrap">{review.body}</p>
          <ActionForm action={moderate.bind(null, review.id, review.updatedAt.toISOString())}>
            <div className="flex gap-3">
              <button name="status" value="APPROVED" className="rounded bg-[#31554d] px-4 py-2 text-white">Approve</button>
              <button name="status" value="REJECTED" className="rounded border px-4 py-2">Reject</button>
            </div>
          </ActionForm>
        </article>
      ))}
      <nav aria-label="Review pages" className="flex gap-4">
        {page > 1 && <Link href={`?status=${status}&page=${page - 1}`}>Previous</Link>}
        <span>Page {page} · {total} reviews</span>
        {page * 25 < total && <Link href={`?status=${status}&page=${page + 1}`}>Next</Link>}
      </nav>
    </div>
  );
}
