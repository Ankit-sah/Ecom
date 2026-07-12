"use client";

import { useState } from "react";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date | string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

type ReviewsClientProps = {
  initialReviews: Review[];
};

export function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);

  const handleStatusChange = async (reviewId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status }),
      });

      if (response.ok) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
      } else {
        alert("Failed to update review status");
      }
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("Failed to update review status");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-orange-500" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-white/85 p-8 text-center">
        <p className="text-neutral-600">No pending reviews to moderate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-orange-200 bg-white/85 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <Link
                  href={`/products/${review.product.slug}`}
                  className="font-semibold text-gray-800 hover:text-orange-500"
                >
                  {review.product.name}
                </Link>
                {renderStars(review.rating)}
                {review.verified && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Verified Purchase
                  </span>
                )}
              </div>
              {review.title && (
                <h4 className="mb-1 font-semibold text-gray-800">{review.title}</h4>
              )}
              {review.comment && (
                <p className="mb-2 text-sm text-neutral-700">{review.comment}</p>
              )}
              <p className="text-xs text-neutral-500">
                By {review.user.name || review.user.email} • {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-4 flex gap-2">
              <button
                onClick={() => handleStatusChange(review.id, "APPROVED")}
                className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange(review.id, "REJECTED")}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


