import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-semibold text-orange-500">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-neutral-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to exploring our
            handcrafted collection.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-orange-500/40 px-6 py-3 text-sm font-semibold text-orange-500 transition hover:border-orange-500 hover:text-orange-600"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}

