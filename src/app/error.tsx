"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-semibold text-orange-500">500</h1>
          <h2 className="text-3xl font-semibold text-gray-800">Something went wrong</h2>
          <p className="text-neutral-600">
            We&apos;re sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
          </p>
          {error.digest && (
            <p className="text-xs text-neutral-500">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-orange-500/40 px-6 py-3 text-sm font-semibold text-orange-500 transition hover:border-orange-500 hover:text-orange-600"
          >
            Go Home
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-neutral-600">
            Need help?{" "}
            <Link href="/contact" className="font-semibold text-orange-500 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

