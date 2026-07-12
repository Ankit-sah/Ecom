"use client";

import { useState } from "react";

type CouponInputProps = {
  onCouponApplied: (discountCents: number, couponCode: string, freeShipping: boolean) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string | null;
  totalCents: number;
};

export function CouponInput({ onCouponApplied, onCouponRemoved, appliedCoupon, totalCents }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), totalCents }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        onCouponApplied(data.discountCents, data.coupon.code, data.freeShipping);
        setCode("");
      } else {
        setError(data.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Failed to validate coupon:", error);
      setError("Failed to validate coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-green-800">
            Coupon {appliedCoupon} applied
          </span>
        </div>
        <button
          onClick={onCouponRemoved}
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
        Have a coupon code?
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Enter coupon code"
          className="flex-1 rounded-lg border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleApply();
            }
          }}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}


