import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics
 * Get analytics data for admin dashboard
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30"; // days

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Sales analytics
    const salesData = await prisma.order.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startDate },
      },
      _sum: {
        totalCents: true,
        subtotalCents: true,
        taxCents: true,
        shippingCents: true,
      },
      _count: {
        _all: true,
      },
      _avg: {
        totalCents: true,
      },
    });

    // Product performance
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: "PAID",
          createdAt: { gte: startDate },
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    // Customer analytics
    const customerStats = await prisma.order.groupBy({
      by: ["userId"],
      where: {
        status: "PAID",
        createdAt: { gte: startDate },
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalCents: true,
      },
    });

    // Revenue by day
    const revenueByDay = await prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: startDate },
      },
      select: {
        totalCents: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      sales: {
        totalRevenue: salesData._sum.totalCents || 0,
        totalOrders: salesData._count._all || 0,
        averageOrderValue: salesData._avg.totalCents || 0,
        subtotal: salesData._sum.subtotalCents || 0,
        tax: salesData._sum.taxCents || 0,
        shipping: salesData._sum.shippingCents || 0,
      },
      topProducts: topProducts.map((item) => ({
        productId: item.productId,
        totalQuantity: item._sum.quantity || 0,
        orderCount: item._count._all || 0,
      })),
      customers: {
        totalCustomers: customerStats.length,
        averageOrderValue: customerStats.length > 0
          ? (customerStats.reduce((sum, c) => sum + (c._sum.totalCents || 0), 0) / customerStats.length)
          : 0,
      },
      revenueByDay,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}


