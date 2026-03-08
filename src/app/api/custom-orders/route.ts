import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate order number: CUST-YYYYMMDD-XXX
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 900 + 100); // 100-999
  return `CUST-${dateStr}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const required = ["theme", "name", "phone", "email", "occasion", "budget", "deliveryDate", "recipientLocation"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate delivery date is not in the past
    const deliveryDate = new Date(body.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate < today) {
      return NextResponse.json(
        { error: "Delivery date cannot be in the past" },
        { status: 400 }
      );
    }

    // Create the custom order
    const customOrder = await prisma.customOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        theme: body.theme,
        name: body.name,
        phone: body.phone,
        email: body.email,
        occasion: body.occasion,
        budget: body.budget,
        deliveryDate: deliveryDate,
        recipientLocation: body.recipientLocation,
        specialRequests: body.specialRequests || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderNumber: customOrder.orderNumber,
        message: "Custom order request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Custom order submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit custom order" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve custom orders (for admin use)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = status ? { status } : {};

    const orders = await prisma.customOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Fetch custom orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom orders" },
      { status: 500 }
    );
  }
}
