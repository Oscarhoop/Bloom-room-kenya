import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} Confirmed | Bloom Room Kenya`,
    description: "Your luxury floral arrangement has been received and is being prepared.",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKes(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

const TIME_SLOT_LABELS: Record<string, string> = {
  MORNING: "08:00 – 12:00",
  AFTERNOON: "12:00 – 17:00",
  EVENING: "17:00 – 20:00",
  EXPRESS: "Express (within 3 hours)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: { select: { firstName: true, email: true } },
      items: { select: { productName: true, quantity: true, unitPriceKes: true, subtotalKes: true } },
    },
  });

  if (!order) notFound();

  const address = order.deliveryAddress as {
    street: string;
    estate: string;
    area: string;
    city: string;
    landmark?: string;
  };

  return (
    <main className="min-h-screen bg-bloom-cream px-6 py-20 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-2xl">
        {/* Success header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full border border-bloom-sage/30 bg-bloom-sage/10 text-3xl">
            🌿
          </div>
          <p className="font-inter mb-2 text-xs uppercase tracking-[0.22em] text-bloom-sage">
            Order Confirmed
          </p>
          <h1 className="font-cormorant text-4xl font-light text-bloom-charcoal">
            Thank you, {order.customer.firstName}
          </h1>
          <p className="font-inter mt-3 text-sm leading-relaxed text-bloom-taupe">
            Your arrangement is being lovingly prepared. A confirmation has been sent to{" "}
            <span className="text-bloom-charcoal">{order.customer.email}</span>.
          </p>
        </div>

        {/* Order card */}
        <div className="space-y-0 border border-bloom-sage-light/30">
          {/* Order number */}
          <div className="flex items-center justify-between border-b border-bloom-sage-light/30 px-6 py-4">
            <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">Order Reference</span>
            <span className="font-inter text-sm font-medium text-bloom-charcoal">{order.orderNumber}</span>
          </div>

          {/* Items */}
          <div className="border-b border-bloom-sage-light/30 px-6 py-5">
            <p className="font-inter mb-3 text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">Items</p>
            <ul className="flex flex-col gap-2">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="font-inter text-sm text-bloom-charcoal">
                    {item.productName} <span className="text-bloom-taupe">× {item.quantity}</span>
                  </span>
                  <span className="font-inter text-sm text-bloom-charcoal">{formatKes(item.subtotalKes)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="flex items-center justify-between border-b border-bloom-sage-light/30 px-6 py-4">
            <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">Subtotal</span>
            <span className="font-inter text-sm text-bloom-charcoal">{formatKes(order.subtotalKes)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-bloom-sage-light/30 px-6 py-4">
            <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">Delivery</span>
            <span className="font-inter text-sm text-bloom-charcoal">{formatKes(order.deliveryFeeKes)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-bloom-sage-light/30 bg-bloom-parchment/40 px-6 py-4">
            <span className="font-inter text-xs uppercase tracking-[0.16em] text-bloom-charcoal">Total Paid</span>
            <span className="font-cormorant text-2xl font-light text-bloom-charcoal">{formatKes(order.totalKes)}</span>
          </div>

          {/* Delivery details */}
          <div className="px-6 py-5">
            <p className="font-inter mb-3 text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">Delivery</p>
            <p className="font-inter text-sm text-bloom-charcoal">{formatDate(order.deliveryDate)}</p>
            <p className="font-inter text-sm text-bloom-taupe">{TIME_SLOT_LABELS[order.deliveryTimeSlot]}</p>
            <p className="font-inter mt-2 text-sm text-bloom-charcoal">
              {address.street}, {address.estate}, {address.area}, {address.city}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/shop"
            className="font-inter border border-bloom-charcoal px-8 py-3 text-xs uppercase tracking-[0.18em] text-bloom-charcoal transition-all duration-300 hover:bg-bloom-charcoal hover:text-bloom-cream"
          >
            Continue Shopping
          </Link>
          <p className="font-inter text-center text-[11px] leading-relaxed text-bloom-taupe">
            Questions? Call us on{" "}
            <a href="tel:+254700000000" className="underline hover:text-bloom-charcoal">
              +254 700 000 000
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
