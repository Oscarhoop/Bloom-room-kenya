import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Seed test orders
export async function POST() {
  try {
    const testCustomers = [
      { firstName: "Alice", lastName: "Wanjiku", email: "alice@test.com", phone: "+254712345001" },
      { firstName: "Brian", lastName: "Otieno", email: "brian@test.com", phone: "+254712345002" },
      { firstName: "Catherine", lastName: "Kamau", email: "cathy@test.com", phone: "+254712345003" },
      { firstName: "David", lastName: "Mwangi", email: "david@test.com", phone: "+254712345004" },
      { firstName: "Emma", lastName: "Ochieng", email: "emma@test.com", phone: "+254712345005" },
    ];

    const createdCustomers = [];
    for (const cust of testCustomers) {
      try {
        // Try to find existing customer first
        let customer = await prisma.customer.findUnique({
          where: { email: cust.email },
        });
        
        // Create if doesn't exist
        if (!customer) {
          customer = await prisma.customer.create({ data: cust });
        }
        
        createdCustomers.push(customer);
      } catch (e) {
        console.log(`Skipped customer ${cust.email} - may already exist`);
      }
    }

    const timestamp = Date.now().toString().slice(-4);
    
    const testOrders = [
      {
        orderNumber: `BLO-TEST-${timestamp}-001`,
        customerId: createdCustomers[0].id,
        orderType: "REGULAR" as const,
        subtotalKes: 3500,
        deliveryFeeKes: 300,
        discountKes: 0,
        totalKes: 3800,
        deliveryDate: new Date(Date.now() + 86400000),
        deliveryTimeSlot: "MORNING",
        deliveryAddress: {
          street: "123 Garden Lane",
          estate: "Kilimani",
          area: "Kilimani",
          city: "Nairobi",
          landmark: "Near Java House",
          instructions: "Ring bell twice",
        },
        orderStatus: "PENDING",
        paymentStatus: "UNPAID",
      },
      {
        orderNumber: `BLO-TEST-${timestamp}-002`,
        customerId: createdCustomers[1].id,
        orderType: "REGULAR" as const,
        subtotalKes: 5200,
        deliveryFeeKes: 300,
        discountKes: 200,
        totalKes: 5300,
        deliveryDate: new Date(Date.now() + 172800000),
        deliveryTimeSlot: "AFTERNOON",
        deliveryAddress: {
          street: "456 Rose Avenue",
          estate: "Westlands",
          area: "Westlands",
          city: "Nairobi",
          landmark: "Opposite Sarit Centre",
          instructions: "Call on arrival",
        },
        orderStatus: "CONFIRMED",
        paymentStatus: "PAID",
        mpesaReceiptNumber: "MPE123456",
      },
      {
        orderNumber: `BLO-TEST-${timestamp}-003`,
        customerId: createdCustomers[2].id,
        orderType: "REGULAR" as const,
        subtotalKes: 7800,
        deliveryFeeKes: 0,
        discountKes: 500,
        totalKes: 7300,
        deliveryDate: new Date(Date.now() + 86400000),
        deliveryTimeSlot: "EVENING",
        deliveryAddress: {
          street: "789 Lily Street",
          estate: "Karen",
          area: "Karen",
          city: "Nairobi",
          landmark: "Near The Hub",
          instructions: "Gate code 1234",
        },
        orderStatus: "ARRANGING",
        paymentStatus: "PAID",
        mpesaReceiptNumber: "MPE789012",
      },
      {
        orderNumber: `BLO-TEST-${timestamp}-004`,
        customerId: createdCustomers[3].id,
        orderType: "REGULAR" as const,
        subtotalKes: 4500,
        deliveryFeeKes: 300,
        discountKes: 0,
        totalKes: 4800,
        deliveryDate: new Date(Date.now() + 43200000),
        deliveryTimeSlot: "MORNING",
        deliveryAddress: {
          street: "321 Tulip Road",
          estate: "Lavington",
          area: "Lavington",
          city: "Nairobi",
          landmark: "Next to Lavington Mall",
          instructions: "Leave with security",
        },
        orderStatus: "OUT_FOR_DELIVERY",
        paymentStatus: "PAID",
        mpesaReceiptNumber: "MPE345678",
      },
      {
        orderNumber: `BLO-TEST-${timestamp}-005`,
        customerId: createdCustomers[4].id,
        orderType: "CUSTOM" as const,
        customTheme: "Money Bouquet",
        customOccasion: "Graduation",
        customBudget: "Ksh 5,000 - 7,000",
        subtotalKes: 6500,
        deliveryFeeKes: 300,
        discountKes: 0,
        totalKes: 6800,
        deliveryDate: new Date(Date.now() + 259200000),
        deliveryTimeSlot: "AFTERNOON",
        deliveryAddress: {
          street: "555 Orchid Boulevard",
          estate: "Runda",
          area: "Runda",
          city: "Nairobi",
          landmark: "Near UN Avenue",
          instructions: "Villa 42",
        },
        orderStatus: "PENDING",
        paymentStatus: "UNPAID",
      },
      {
        orderNumber: `BLO-TEST-${timestamp}-006`,
        customerId: createdCustomers[0].id,
        orderType: "CUSTOM" as const,
        customTheme: "Baby Shower",
        customOccasion: "Gender Reveal",
        customBudget: "Ksh 3,500",
        subtotalKes: 3500,
        deliveryFeeKes: 300,
        discountKes: 0,
        totalKes: 3800,
        deliveryDate: new Date(Date.now() + 345600000),
        deliveryTimeSlot: "EVENING",
        deliveryAddress: {
          street: "777 Daisy Court",
          estate: "Muthaiga",
          area: "Muthaiga",
          city: "Nairobi",
          landmark: "Near Muthaiga Country Club",
          instructions: "Main house",
        },
        orderStatus: "CONFIRMED",
        paymentStatus: "PAID",
        mpesaReceiptNumber: "MPE901234",
      },
    ];

    const createdOrders = [];
    for (const order of testOrders) {
      const created = await prisma.order.create({ data: order });
      createdOrders.push(created);
    }

    // Add order items for regular orders
    const orderItems = [
      { orderId: createdOrders[0].id, productSku: "ROSE-001", productName: "Red Roses Bouquet", quantity: 1, unitPriceKes: 3500, subtotalKes: 3500 },
      { orderId: createdOrders[1].id, productSku: "MIX-001", productName: "Mixed Spring Flowers", quantity: 2, unitPriceKes: 2600, subtotalKes: 5200 },
      { orderId: createdOrders[2].id, productSku: "ORCH-001", productName: "Premium Orchids", quantity: 1, unitPriceKes: 7800, subtotalKes: 7800 },
      { orderId: createdOrders[3].id, productSku: "LILY-001", productName: "White Lilies Arrangement", quantity: 1, unitPriceKes: 4500, subtotalKes: 4500 },
    ];

    for (const item of orderItems) {
      await prisma.orderItem.create({ data: item });
    }

    return NextResponse.json({
      success: true,
      message: "Test data seeded successfully",
      stats: {
        customers: createdCustomers.length,
        orders: createdOrders.length,
        items: orderItems.length,
      },
      orders: createdOrders.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.orderStatus })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed test data", details: String(error) },
      { status: 500 }
    );
  }
}
