import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ComparisonView } from "@/components/products/product-comparison";

export default async function ComparePage() {
  const session = await getServerSession(authOptions);
  
  // Get comparison from database
  const comparison = await prisma.productComparison.findFirst({
    where: session?.user?.id
      ? { userId: session.user.id }
      : undefined,
    orderBy: { updatedAt: "desc" },
  });

  if (!comparison || comparison.products.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-semibold text-gray-800">Compare Products</h1>
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white/75 p-12 text-center">
          <p className="text-neutral-600">No products to compare. Add products from product pages to compare them.</p>
        </div>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: comparison.products },
      published: true,
    },
    include: {
      category: true,
      artisan: true,
    },
  });

  // Convert to serializable format matching Product type
  const serializedProducts = products.map((product) => ({
    ...product,
    details: product.details as Record<string, unknown> | null,
    publishedAt: product.publishedAt?.toISOString() || null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold text-gray-800">Compare Products</h1>
      <ComparisonView initialProducts={serializedProducts} />
    </div>
  );
}


