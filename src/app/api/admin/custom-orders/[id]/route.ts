import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CustomOrderStatus, PaymentStatus } from "@prisma/client";

// PATCH - Update custom order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, finalPriceKes, adminNotes } = body;

    const updateData: {
      status?: CustomOrderStatus;
      paymentStatus?: PaymentStatus;
      finalPriceKes?: number;
      adminNotes?: string;
      contactedAt?: Date | null;
    } = {};

    if (status) {
      updateData.status = status;
      
      // Auto-set contactedAt when status changes to CONTACTED
      if (status === "CONTACTED") {
        updateData.contactedAt = new Date();
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (finalPriceKes !== undefined) {
      updateData.finalPriceKes = finalPriceKes;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const order = await prisma.customOrder.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        finalPriceKes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      message: `Custom order ${order.orderNumber} updated`,
    });
  } catch (error) {
    console.error("Update custom order error:", error);
    return NextResponse.json(
      { error: "Failed to update custom order" },
      { status: 500 }
    );
  }
}

// GET - Single custom order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.customOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Fetch custom order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom order" },
      { status: 500 }
    );
  }
}
