import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Daraja API helpers ────────────────────────────────────────────────────────

const DARAJA_BASE = "https://sandbox.safaricom.co.ke"; // Change to production URL when live

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Daraja auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

function getPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

// ─── POST /api/mpesa/stk-push ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, phone } = body as { orderId: string; phone: string };

    if (!orderId || !phone) {
      return NextResponse.json(
        { success: false, error: "orderId and phone are required." },
        { status: 400 }
      );
    }

    // Look up the order to get the correct amount
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { totalKes: true, orderNumber: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Order is already paid." },
        { status: 409 }
      );
    }

    // Normalise phone: strip leading + or 0 and prepend 254
    const normalised = phone
      .replace(/\s+/g, "")
      .replace(/^\+/, "")
      .replace(/^0/, "254");

    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    const timestamp = getTimestamp();
    const password = getPassword(shortcode, passkey, timestamp);

    // Initiate STK Push
    const accessToken = await getAccessToken();

    const stkRes = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: order.totalKes,
        PartyA: normalised,
        PartyB: shortcode,
        PhoneNumber: normalised,
        CallBackURL: `${callbackUrl}/api/mpesa/callback`,
        AccountReference: order.orderNumber,
        TransactionDesc: `Bloom Room Kenya – ${order.orderNumber}`,
      }),
    });

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData.ResponseCode !== "0") {
      console.error("STK Push failed:", stkData);
      return NextResponse.json(
        { success: false, error: "M-Pesa STK Push failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      message: "Please check your phone for the M-Pesa payment prompt.",
    });
  } catch (error) {
    console.error("M-Pesa STK Push error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
