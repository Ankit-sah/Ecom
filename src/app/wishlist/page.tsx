import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistClient } from "@/components/wishlist/wishlist-client";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
          artisan: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert to serializable format
  const serializedWishlist = wishlist.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    product: {
      ...item.product,
      details: item.product.details as Record<string, unknown> | null,
      publishedAt: item.product.publishedAt?.toISOString() || null,
      createdAt: item.product.createdAt.toISOString(),
      updatedAt: item.product.updatedAt.toISOString(),
      category: item.product.category ? {
        id: item.product.category.id,
        name: item.product.category.name,
        slug: item.product.category.slug,
        description: item.product.category.description || null,
      } : null,
      artisan: item.product.artisan ? {
        id: item.product.artisan.id,
        name: item.product.artisan.name,
        location: item.product.artisan.location || null,
        photoUrl: item.product.artisan.photoUrl || null,
      } : null,
    },
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold text-gray-800">My Wishlist</h1>
      <WishlistClient initialWishlist={serializedWishlist} />
    </div>
  );
}


