import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Migrate custom orders to unified Order table
export async function POST(req: NextRequest) {
  try {
    // Get all custom orders from old table
    const customOrders = await (prisma as any).customOrder.findMany();
    
    let migrated = 0;
    let failed = 0;
    let skipped = 0;

    for (const customOrder of customOrders) {
      try {
        // Check if already migrated (by orderNumber)
        const existing = await prisma.order.findUnique({
          where: { orderNumber: customOrder.orderNumber },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create or find customer for this custom order
        let customer = await prisma.customer.findUnique({
          where: { email: customOrder.email },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              firstName: customOrder.name.split(" ")[0] || customOrder.name,
              lastName: customOrder.name.split(" ").slice(1).join(" ") || "",
              email: customOrder.email,
              phone: customOrder.phone,
            },
          });
        }

        // Map status from CustomOrderStatus to OrderStatus
        const statusMap: Record<string, string> = {
          PENDING: "PENDING",
          CONTACTED: "CONFIRMED",
          CONFIRMED: "CONFIRMED",
          IN_PROGRESS: "ARRANGING",
          READY: "OUT_FOR_DELIVERY",
          DELIVERED: "DELIVERED",
          CANCELLED: "CANCELLED",
        };

        // Create unified order
        await prisma.order.create({
          data: {
            orderNumber: customOrder.orderNumber,
            customerId: customer.id,
            orderType: "CUSTOM",
            customTheme: customOrder.theme,
            customOccasion: customOrder.occasion,
            customBudget: customOrder.budget,
            subtotalKes: customOrder.finalPriceKes || 0,
            deliveryFeeKes: 0,
            discountKes: 0,
            totalKes: customOrder.finalPriceKes || 0,
            deliveryDate: customOrder.deliveryDate,
            deliveryTimeSlot: "MORNING",
            deliveryAddress: {
              street: customOrder.recipientLocation,
              estate: "",
              area: customOrder.recipientLocation,
              city: "Nairobi",
              landmark: "",
              instructions: customOrder.specialRequests || "",
            },
            deliveryNotes: customOrder.specialRequests,
            orderStatus: (statusMap[customOrder.status] as any) || "PENDING",
            paymentStatus: customOrder.paymentStatus,
            internalNotes: customOrder.adminNotes,
            customAdminNotes: customOrder.adminNotes,
            createdAt: customOrder.createdAt,
            updatedAt: customOrder.updatedAt,
            confirmedAt: customOrder.contactedAt,
            deliveredAt: customOrder.status === "DELIVERED" ? new Date() : null,
          },
        });

        migrated++;
      } catch (error) {
        failed++;
        console.error(`Failed to migrate ${customOrder.orderNumber}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration complete",
      stats: {
        total: customOrders.length,
        migrated,
        failed,
        skipped,
      },
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
