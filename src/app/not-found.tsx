import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-semibold text-[#8a2040]">404</h1>
          <h2 className="text-3xl font-semibold text-[#40111f]">Page Not Found</h2>
          <p className="text-neutral-600">
            The page you're looking for doesn't exist or has been moved. Let's get you back to exploring our
            handcrafted collection.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-[#8a2040]/40 px-6 py-3 text-sm font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}

