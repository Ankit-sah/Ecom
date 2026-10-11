"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Review = { id: string; rating: number; title: string; body: string; verifiedPurchase: boolean; createdAt: string; name: string };

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]); const [loading, setLoading] = useState(true); const [rating, setRating] = useState(5); const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [message, setMessage] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch(`/api/reviews?productId=${productId}`).then((r) => r.json()).then((data: { reviews?: Review[] }) => setReviews(data.reviews ?? [])).catch(() => setMessage("Reviews are unavailable right now.")).finally(() => setLoading(false)); }, [productId]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setMessage(null);
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, rating, title, body }) });
      const data = await response.json();
      if (!response.ok) setMessage(data.error || "Unable to save your review.");
      else {
        setReviews(current => current.filter(review => review.id !== data.review.id));
        setTitle(""); setBody(""); setMessage("Thanks — your review has been submitted for staff approval.");
      }
    } catch { setMessage("Unable to save your review. Please try again."); }
    finally { setSubmitting(false); }
  }

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;
  return <section className="rounded-3xl border border-[#ddcfbb] bg-white p-6 sm:p-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9472f]">Customer notes</p><h2 className="mt-2 font-serif text-3xl text-[#242b25]">Verified reviews</h2></div><p className="text-sm font-semibold text-[#31554d]">{average ? `${average.toFixed(1)} / 5 · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}` : "Purchased pieces can be reviewed"}</p></div><div className="mt-7 grid gap-8 lg:grid-cols-[1fr_.85fr]"><div className="space-y-4">{loading ? <p className="text-sm text-neutral-500">Loading reviews…</p> : reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-2xl bg-[#fbf6ed] p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-[#242b25]">{review.title}</p><span className="text-amber-600" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p className="mt-2 text-sm leading-6 text-neutral-700">{review.body}</p><p className="mt-3 text-xs font-semibold text-[#31554d]">{review.name} · {review.verifiedPurchase ? "Verified purchase" : "Customer"}</p></article>) : <p className="rounded-2xl bg-[#fbf6ed] p-5 text-sm text-neutral-600">No reviews yet. Customers who have bought this piece can share the first one.</p>}</div><form onSubmit={submit} className="rounded-2xl border border-[#ddcfbb] p-5"><h3 className="font-semibold text-[#242b25]">Share your experience</h3><p className="mt-1 text-xs leading-5 text-neutral-600">Reviews are available to customers with a completed purchase.</p><label className="mt-4 block text-sm font-medium">Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#ddcfbb] p-2">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label className="mt-3 block text-sm font-medium">Title<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={100} className="mt-1 w-full rounded-lg border border-[#ddcfbb] p-2" /></label><label className="mt-3 block text-sm font-medium">Review<textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={1200} rows={4} className="mt-1 w-full rounded-lg border border-[#ddcfbb] p-2" /></label>{message ? <p role="status" className="mt-3 text-xs text-[#31554d]">{message}</p> : null}<button disabled={submitting} className="mt-4 rounded-full bg-[#b9472f] px-5 py-2.5 text-sm font-semibold text-white disabled:bg-neutral-300">{submitting ? "Saving…" : "Submit review"}</button><Link href="/auth/sign-in" className="ml-3 text-xs font-semibold text-[#b9472f] underline">Sign in</Link></form></div></section>;
}
