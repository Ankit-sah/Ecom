"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
};

type ReviewsData = {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

type ProductReviewsProps = {
  productId: string;
};

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviewsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchReviews();
        setShowForm(false);
        setFormData({ rating: 5, title: "", comment: "" });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "w-3 h-3" : "w-5 h-5";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${star <= rating ? "text-orange-500" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  if (!reviewsData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="rounded-2xl border border-orange-200 bg-white/85 p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center justify-center border-b border-orange-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <div className="text-4xl font-bold text-orange-500">
              {reviewsData.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(reviewsData.averageRating))}
            <div className="mt-2 text-sm text-neutral-600">
              {reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewsData.ratingDistribution[rating as keyof typeof reviewsData.ratingDistribution];
              const percentage = reviewsData.totalReviews > 0
                ? (count / reviewsData.totalReviews) * 100
                : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{rating}</span>
                    <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-neutral-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-orange-200 bg-white/85 p-6">
          <h3 className="text-lg font-semibold text-gray-800">Write a Review</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="focus:outline-none"
                >
                  {renderStars(rating, "md")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title (optional)
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              placeholder="Summary of your experience"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Review
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2"
              placeholder="Share your experience with this product..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ rating: 5, title: "", comment: "" });
              }}
              className="rounded-full border border-orange-200 px-6 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsData.reviews.length === 0 ? (
          <p className="text-center text-neutral-600">No reviews yet. Be the first to review!</p>
        ) : (
          reviewsData.reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-orange-200 bg-white/85 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      {(review.user.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {review.user.name || "Anonymous"}
                      </span>
                      {review.verified && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, "sm")}
                      <span className="text-xs text-neutral-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className="mt-3 font-semibold text-gray-800">{review.title}</h4>
              )}

              {review.comment && (
                <p className="mt-2 text-sm text-neutral-700">{review.comment}</p>
              )}

              {review.images.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {review.images.map((image, idx) => (
                    <Image
                      key={idx}
                      src={image}
                      alt={`Review image ${idx + 1}`}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-neutral-600 hover:text-orange-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


