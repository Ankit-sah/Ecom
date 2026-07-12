import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "@/components/admin/reviews-client";

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    redirect("/");
  }

  const pendingReviews = await prisma.productReview.findMany({
    where: { status: "PENDING" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Review Moderation</h1>
      <ReviewsClient initialReviews={pendingReviews} />
    </div>
  );
}


