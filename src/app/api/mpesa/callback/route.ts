import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

// ─── POST /api/mpesa/callback ─────────────────────────────────────────────────
// Safaricom calls this URL after the customer approves/declines the STK prompt.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const { ResultCode, CallbackMetadata, MerchantRequestID } = callback;

    // ResultCode 0 = success, anything else = failure/cancellation
    if (ResultCode !== 0) {
      console.log(`M-Pesa payment failed/cancelled. MerchantRequestID: ${MerchantRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Extract M-Pesa receipt number and amount from callback metadata
    const items: Array<{ Name: string; Value: string | number }> =
      CallbackMetadata?.Item ?? [];

    const get = (name: string) =>
      items.find((i) => i.Name === name)?.Value ?? null;

    const mpesaReceiptNumber = get("MpesaReceiptNumber") as string | null;
    const accountRef = get("AccountReference") as string | null; // This is our orderNumber

    if (!accountRef) {
      console.error("M-Pesa callback missing AccountReference");
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Update the order payment status
    await prisma.order.update({
      where: { orderNumber: accountRef },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED" as OrderStatus,
        mpesaReceiptNumber: mpesaReceiptNumber ?? undefined,
        confirmedAt: new Date(),
      },
    });

    console.log(`Order ${accountRef} marked as PAID. Receipt: ${mpesaReceiptNumber}`);

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    // Always return 200 to Safaricom even on internal error
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
