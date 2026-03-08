import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      customOrdersPending,
      totalRevenue,
      recentOrders,
      recentCustomOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: { orderStatus: { in: ["PENDING", "CONFIRMED", "ARRANGING"] } },
      }),
      prisma.order.count({
        where: { orderType: "CUSTOM", orderStatus: "PENDING" },
      }),
      prisma.order.aggregate({
        _sum: { totalKes: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          paymentStatus: true,
          totalKes: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdAt: true,
        },
      }),
      (prisma as any).customOrder.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          theme: true,
          name: true,
          status: true,
          budget: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        customOrdersPending,
        totalRevenue: totalRevenue._sum.totalKes || 0,
      },
      recentOrders,
      recentCustomOrders,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
