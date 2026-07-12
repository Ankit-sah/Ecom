"use client";

import { useState } from "react";

type StockAlertButtonProps = {
  productId: string;
  productName: string;
};

export function StockAlertButton({ productId, productName }: StockAlertButtonProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/stock-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        ✅ You&apos;ll be notified when this product is back in stock!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="space-y-2">
      <label htmlFor="stock-alert-email" className="block text-sm font-medium text-gray-700">
        Notify me when back in stock
      </label>
      <div className="flex gap-2">
        <input
          id="stock-alert-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-lg border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Subscribing..." : "Notify Me"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}


