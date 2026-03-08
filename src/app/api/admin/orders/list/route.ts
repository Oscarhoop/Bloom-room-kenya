import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all order IDs for navigation
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
