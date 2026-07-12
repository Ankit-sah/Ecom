"use client";

import { useState } from "react";

type NewsletterSignupProps = {
  variant?: "default" | "inline" | "minimal";
  source?: string;
};

export function NewsletterSignup({ variant = "default", source = "website" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Successfully subscribed!");
        setEmail("");
        setName("");
      } else {
        setError(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="flex-1 rounded-lg border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          Subscribe
        </button>
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 rounded-lg border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <h3 className="text-2xl font-semibold text-gray-800">Stay Connected</h3>
      <p className="mt-2 text-sm text-neutral-600">
        Subscribe to our newsletter for exclusive offers, new collections, and artisan stories.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700">
            Name (optional)
          </label>
          <input
            id="newsletter-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 focus:border-orange-500 focus:outline-none"
            placeholder="your@email.com"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Subscribing..." : "Subscribe to Newsletter"}
        </button>
        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}


