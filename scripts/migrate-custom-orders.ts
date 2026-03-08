import { prisma } from "@/lib/prisma";

async function migrateCustomOrders() {
  console.log("Starting migration of custom orders...");

  // Get all custom orders from old table
  const customOrders = await prisma.customOrder.findMany();
  console.log(`Found ${customOrders.length} custom orders to migrate`);

  let migrated = 0;
  let failed = 0;

  for (const customOrder of customOrders) {
    try {
      // Check if already migrated (by orderNumber)
      const existing = await prisma.order.findUnique({
        where: { orderNumber: customOrder.orderNumber },
      });

      if (existing) {
        console.log(`Skipping ${customOrder.orderNumber} - already migrated`);
        continue;
      }

      // Create customer for this custom order
      const customer = await prisma.customer.create({
        data: {
          firstName: customOrder.name.split(" ")[0] || customOrder.name,
          lastName: customOrder.name.split(" ").slice(1).join(" ") || "",
          email: customOrder.email,
          phone: customOrder.phone,
        },
      });

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
          // Pricing - use finalPriceKes if set, otherwise 0
          subtotalKes: customOrder.finalPriceKes || 0,
          deliveryFeeKes: 0,
          discountKes: 0,
          totalKes: customOrder.finalPriceKes || 0,
          // Delivery
          deliveryDate: customOrder.deliveryDate,
          deliveryTimeSlot: "MORNING", // Default for custom orders
          deliveryAddress: {
            street: customOrder.recipientLocation,
            estate: "",
            area: customOrder.recipientLocation,
            city: "Nairobi",
            landmark: "",
            instructions: customOrder.specialRequests || "",
          },
          deliveryNotes: customOrder.specialRequests,
          // Status
          orderStatus: (statusMap[customOrder.status] as any) || "PENDING",
          paymentStatus: customOrder.paymentStatus,
          // Notes
          internalNotes: customOrder.adminNotes,
          customAdminNotes: customOrder.adminNotes,
          // Timestamps
          createdAt: customOrder.createdAt,
          updatedAt: customOrder.updatedAt,
          confirmedAt: customOrder.contactedAt,
          deliveredAt: customOrder.status === "DELIVERED" ? new Date() : null,
        },
      });

      migrated++;
      console.log(`✓ Migrated ${customOrder.orderNumber}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed to migrate ${customOrder.orderNumber}:`, error);
    }
  }

  console.log("\nMigration complete:");
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped (already exists): ${customOrders.length - migrated - failed}`);

  await prisma.$disconnect();
}

migrateCustomOrders().catch(console.error);
