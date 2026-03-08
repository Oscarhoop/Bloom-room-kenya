import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

// PATCH - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, internalNotes } = body;

    const updateData: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
      internalNotes?: string;
      deliveredAt?: Date | null;
      confirmedAt?: Date | null;
    } = {};

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      
      // Auto-set timestamps based on status
      if (orderStatus === "DELIVERED") {
        updateData.deliveredAt = new Date();
      }
      if (orderStatus === "CONFIRMED") {
        updateData.confirmedAt = new Date();
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      message: `Order ${order.orderNumber} updated to ${order.orderStatus}`,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// GET - Single order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                sku: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
