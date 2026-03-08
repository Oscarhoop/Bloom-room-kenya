import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CheckoutPayload } from "@/types/checkout";

// Helper to validate Kenyan phone numbers
// Supports: +2547..., 07..., 2547..., +2541..., 01..., 2541...
function isValidKenyanPhone(phone: string): boolean {
  if (!phone) return false;
  const phoneRegex = /^(?:254|\+254|0)?([71][0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Helper to validate the delivery date is not in the past
function isValidDeliveryDate(dateStr: string): boolean {
  const deliveryDate = new Date(dateStr);
  const today = new Date();
  
  // Set both to midnight to ignore time-of-day offsets
  today.setHours(0, 0, 0, 0);
  deliveryDate.setHours(0, 0, 0, 0);

  return deliveryDate.getTime() >= today.getTime();
}

// Generate human-readable order reference like BLM-20240308-ABCD
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BLM-${dateStr}-${randomStr}`;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutPayload = await req.json();
    const { customer, order, items } = body;
    const fieldErrors: Record<string, string> = {};

    // ─── 1. Core Validation ──────────────────────────────────────────────────────────
    if (!customer || !order || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request. Missing core fields or empty cart." },
        { status: 400 }
      );
    }

    if (!isValidKenyanPhone(customer.phone)) {
      fieldErrors.phone = "Invalid Kenyan phone number format.";
    }

    if (order.isGift && order.recipientPhone && !isValidKenyanPhone(order.recipientPhone)) {
      fieldErrors.recipientPhone = "Invalid Kenyan phone number format for recipient.";
    }

    if (!isValidDeliveryDate(order.deliveryDate)) {
      fieldErrors.deliveryDate = "Delivery date cannot be in the past.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    // ─── 2. Server-side Pricing calculation ──────────────────────────────────────────
    // Important: NEVER trust prices sent by the client. Fetch real sizes from DB.
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "One or more products could not be verified." },
        { status: 404 }
      );
    }

    let subtotalKes = 0;
    const orderItemsData = items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      const lineTotal = product.priceKes * item.quantity;
      subtotalKes += lineTotal;

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        thumbnailUrl: product.thumbnailUrl,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        unitPriceKes: product.priceKes, // DB pricing
        quantity: item.quantity,
        subtotalKes: lineTotal,
      };
    });

    // Flat Nairobi delivery fee: KES 500
    const deliveryFeeKes = 500;
    const totalKes = subtotalKes + deliveryFeeKes;

    // ─── 3. Database Transaction ───────────────────────────────────────────────────
    const newOrder = await prisma.$transaction(async (tx) => {
      // Find customer by email or create new 
      let dbCustomer = await tx.customer.findUnique({
        where: { email: customer.email },
      });

      if (!dbCustomer) {
        dbCustomer = await tx.customer.create({
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
          },
        });
      }

      // Create the order atomically with its items
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: dbCustomer.id,
          isGift: order.isGift,
          giftMessage: order.giftMessage,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          deliveryDate: new Date(order.deliveryDate),
          deliveryTimeSlot: order.deliveryTimeSlot,
          deliveryAddress: JSON.parse(JSON.stringify(order.deliveryAddress)), 
          deliveryNotes: order.deliveryNotes,
          subtotalKes,
          deliveryFeeKes,
          totalKes,
          paymentMethod: order.paymentMethod,
          items: {
            create: orderItemsData,
          },
        },
      });

      return createdOrder;
    });

    // Success response
    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });

  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while processing the order." },
      { status: 500 }
    );
  }
}
