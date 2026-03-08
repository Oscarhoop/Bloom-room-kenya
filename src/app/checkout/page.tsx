"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import type { CheckoutPayload } from "@/types/checkout";
import type { DeliveryTimeSlot, PaymentMethod } from "@prisma/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKes(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function isSunday(dateStr: string) {
  return new Date(dateStr).getDay() === 0;
}

// ─── Form State Types ─────────────────────────────────────────────────────────

interface FormState {
  // Customer
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Delivery
  street: string;
  estate: string;
  area: string;
  city: string;
  landmark: string;
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot;
  deliveryNotes: string;
  // Gift
  isGift: boolean;
  giftMessage: string;
  recipientName: string;
  recipientPhone: string;
  // Payment
  paymentMethod: PaymentMethod;
}

const INITIAL: FormState = {
  // Customer
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  // Delivery
  street: "",
  estate: "",
  area: "",
  city: "Nairobi",
  landmark: "",
  deliveryDate: "",
  deliveryTimeSlot: "MORNING",
  deliveryNotes: "",
  // Gift
  isGift: false,
  giftMessage: "",
  recipientName: "",
  recipientPhone: "",
  // Payment
  paymentMethod: "MPESA",
};

// ─── Test Data for Development ────────────────────────────────────────────────

const TEST_DATA: FormState = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  phone: "0712345678",
  street: "14 Ngong Road, Westlands Tower",
  estate: "Lavington",
  area: "Westlands",
  city: "Nairobi",
  landmark: "Next to Sarit Centre",
  deliveryDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
  deliveryTimeSlot: "AFTERNOON",
  deliveryNotes: "Gate code: 1234, 3rd floor",
  isGift: true,
  giftMessage: "Happy Birthday! Wishing you a day filled with love and beautiful moments. 🌸",
  recipientName: "Mary Wanjiku",
  recipientPhone: "0723456789",
  paymentMethod: "MPESA",
};

// ─── UI Sub-components ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-cormorant mb-6 text-2xl font-light text-bloom-charcoal">
      {children}
    </h2>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="font-inter mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">
      {children}
    </label>
  );
}

function Input({
  id,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  return (
    <div>
      <input
        id={id}
        {...props}
        className={`font-inter w-full border bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal placeholder:text-bloom-taupe/60 transition-all duration-200 focus:bg-bloom-cream focus:outline-none ${
          error ? "border-rose-400" : "border-bloom-sage-light/50 focus:border-bloom-charcoal"
        }`}
      />
      {error && <p className="font-inter mt-1 text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const DELIVERY_FEE = 500;
  const total = totalPrice + DELIVERY_FEE;

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.estate.trim()) e.estate = "Required";
    if (!form.area.trim()) e.area = "Required";
    if (!form.deliveryDate) {
      e.deliveryDate = "Please pick a delivery date";
    } else if (isSunday(form.deliveryDate)) {
      e.deliveryDate = "We don't deliver on Sundays";
    }
    if (form.isGift && !form.giftMessage.trim()) e.giftMessage = "Add a message or uncheck 'This is a gift'";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !validate()) return;

    const payload: CheckoutPayload = {
      customer: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      },
      order: {
        isGift: form.isGift,
        giftMessage: form.giftMessage || undefined,
        recipientName: form.recipientName || undefined,
        recipientPhone: form.recipientPhone || undefined,
        deliveryDate: form.deliveryDate,
        deliveryTimeSlot: form.deliveryTimeSlot,
        deliveryAddress: {
          street: form.street,
          estate: form.estate,
          area: form.area,
          city: form.city,
          landmark: form.landmark || undefined,
          instructions: form.deliveryNotes || undefined,
        },
        deliveryNotes: form.deliveryNotes || undefined,
        paymentMethod: form.paymentMethod,
      },
      items: items.map((i) => ({
        productId: i.id,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
        selectedSize: i.selectedSize,
      })),
    };

    setSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        }
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Empty cart guard ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bloom-cream px-6 text-center">
        <div className="mb-6 text-5xl">🌿</div>
        <h1 className="font-cormorant mb-3 text-3xl font-light text-bloom-charcoal">Your cart is empty</h1>
        <p className="font-inter mb-8 text-sm text-bloom-taupe">Add some arrangements before checking out.</p>
        <Link href="/shop" className="font-inter border border-bloom-charcoal px-8 py-3 text-xs uppercase tracking-[0.18em] text-bloom-charcoal transition-all hover:bg-bloom-charcoal hover:text-bloom-cream">
          Browse the Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bloom-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-12 lg:px-24 lg:py-20">
        {/* Page Title */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-inter mb-2 text-xs uppercase tracking-[0.22em] text-bloom-sage">Bloom Room Kenya</p>
            <h1 className="font-cormorant text-5xl font-light text-bloom-charcoal">Checkout</h1>
          </div>
          <button
            type="button"
            onClick={() => setForm(TEST_DATA)}
            className="font-inter self-start border border-bloom-sage-light/50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-taupe transition-all hover:border-bloom-charcoal hover:text-bloom-charcoal"
          >
            🧪 Fill Test Data
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_380px]">

            {/* ── Left: Form ── */}
            <div className="flex flex-col gap-10">

              {/* Customer Details */}
              <section>
                <SectionTitle>Your Details</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Jane" error={errors.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Doe" error={errors.lastName} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" error={errors.email} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (M-Pesa) *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0712 345 678" error={errors.phone} />
                  </div>
                </div>
              </section>

              {/* Delivery */}
              <section>
                <SectionTitle>Delivery Details</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="street">Street / Building *</Label>
                    <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="e.g. 14 Ngong Road, Westlands Tower" error={errors.street} />
                  </div>
                  <div>
                    <Label htmlFor="estate">Estate / Suburb *</Label>
                    <Input id="estate" value={form.estate} onChange={(e) => set("estate", e.target.value)} placeholder="e.g. Lavington" error={errors.estate} />
                  </div>
                  <div>
                    <Label htmlFor="area">Area *</Label>
                    <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Westlands" error={errors.area} />
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark (optional)</Label>
                    <Input id="landmark" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="e.g. Next to Sarit Centre" />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Delivery Date *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={form.deliveryDate}
                      min={todayISO()}
                      onChange={(e) => { if (!isSunday(e.target.value)) set("deliveryDate", e.target.value); }}
                      error={errors.deliveryDate}
                    />
                    <p className="font-inter mt-1.5 text-[11px] text-bloom-taupe">Mon – Sat only. Sundays unavailable.</p>
                  </div>
                  <div>
                    <Label htmlFor="deliveryTimeSlot">Preferred Time Slot</Label>
                    <select
                      id="deliveryTimeSlot"
                      value={form.deliveryTimeSlot}
                      onChange={(e) => set("deliveryTimeSlot", e.target.value as DeliveryTimeSlot)}
                      className="font-inter w-full border border-bloom-sage-light/50 bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal focus:border-bloom-charcoal focus:outline-none"
                    >
                      <option value="MORNING">Morning (08:00 – 12:00)</option>
                      <option value="AFTERNOON">Afternoon (12:00 – 17:00)</option>
                      <option value="EVENING">Evening (17:00 – 20:00)</option>
                      <option value="EXPRESS">Express — within 3 hours (+KES 1,500)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="deliveryNotes">Delivery Notes (optional)</Label>
                    <Input id="deliveryNotes" value={form.deliveryNotes} onChange={(e) => set("deliveryNotes", e.target.value)} placeholder="Gate code, apartment number, etc." />
                  </div>
                </div>
              </section>

              {/* Gift */}
              <section>
                <SectionTitle>Gift Options</SectionTitle>
                <label className="flex cursor-pointer items-center gap-3">
                  <div
                    role="checkbox"
                    aria-checked={form.isGift}
                    tabIndex={0}
                    id="is-gift"
                    onClick={() => set("isGift", !form.isGift)}
                    onKeyDown={(e) => e.key === " " && set("isGift", !form.isGift)}
                    className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ${form.isGift ? "bg-bloom-sage" : "bg-bloom-sage-light/50"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.isGift ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="font-inter text-xs uppercase tracking-[0.16em] text-bloom-charcoal">This is a gift</span>
                </label>

                {form.isGift && (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input id="recipientName" value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} placeholder="Who should receive this?" />
                    </div>
                    <div>
                      <Label htmlFor="recipientPhone">Recipient Phone</Label>
                      <Input id="recipientPhone" type="tel" value={form.recipientPhone} onChange={(e) => set("recipientPhone", e.target.value)} placeholder="0712 345 678" error={errors.recipientPhone} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="giftMessage">Gift Message *</Label>
                      <textarea
                        id="giftMessage"
                        maxLength={280}
                        rows={3}
                        value={form.giftMessage}
                        onChange={(e) => set("giftMessage", e.target.value)}
                        placeholder="Write a heartfelt message for the card..."
                        className={`font-inter w-full resize-none border bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal placeholder:text-bloom-taupe/60 focus:bg-bloom-cream focus:outline-none ${errors.giftMessage ? "border-rose-400" : "border-bloom-sage-light/50 focus:border-bloom-charcoal"}`}
                      />
                      {errors.giftMessage && <p className="font-inter mt-1 text-[11px] text-rose-500">{errors.giftMessage}</p>}
                      <p className="font-inter mt-1 text-right text-[11px] text-bloom-taupe">{form.giftMessage.length} / 280</p>
                    </div>
                  </div>
                )}
              </section>

              {/* Payment */}
              <section>
                <SectionTitle>Payment Method</SectionTitle>
                <div className="flex flex-col gap-3">
                  {(["MPESA", "CARD", "CASH_ON_DELIVERY"] as PaymentMethod[]).map((method) => {
                    const labels: Record<string, string> = {
                      MPESA: "M-Pesa",
                      CARD: "Debit / Credit Card",
                      CASH_ON_DELIVERY: "Cash on Delivery",
                    };
                    const subs: Record<string, string> = {
                      MPESA: "Pay via M-Pesa STK Push — you'll receive a prompt on your phone.",
                      CARD: "Visa or Mastercard — secure payment on delivery or online.",
                      CASH_ON_DELIVERY: "Pay in cash when your arrangement arrives.",
                    };
                    return (
                      <label
                        key={method}
                        htmlFor={`pay-${method}`}
                        className={`flex cursor-pointer items-start gap-4 border p-4 transition-all duration-200 ${form.paymentMethod === method ? "border-bloom-charcoal bg-bloom-parchment" : "border-bloom-sage-light/40 hover:border-bloom-charcoal/40"}`}
                      >
                        <input
                          type="radio"
                          id={`pay-${method}`}
                          name="paymentMethod"
                          value={method}
                          checked={form.paymentMethod === method}
                          onChange={() => set("paymentMethod", method)}
                          className="mt-0.5 accent-bloom-charcoal"
                        />
                        <div>
                          <p className="font-inter text-xs font-medium uppercase tracking-[0.14em] text-bloom-charcoal">{labels[method]}</p>
                          <p className="font-inter mt-0.5 text-[11px] leading-relaxed text-bloom-taupe">{subs[method]}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* ── Right: Order Summary ── */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="border border-bloom-sage-light/30 bg-bloom-parchment/40 p-6">
                <h2 className="font-cormorant mb-5 text-xl font-light text-bloom-charcoal">Order Summary</h2>

                <ul className="mb-5 flex flex-col divide-y divide-bloom-sage-light/20">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 py-3">
                      <div className="h-12 w-10 shrink-0 bg-bloom-sage-light/20 flex items-center justify-center text-lg">🌸</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-xs text-bloom-charcoal truncate">{item.name}</p>
                        <p className="font-inter text-[11px] text-bloom-taupe">Qty {item.quantity}</p>
                      </div>
                      <p className="font-inter shrink-0 text-xs text-bloom-charcoal">
                        {formatKes(item.priceKes * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 border-t border-bloom-sage-light/30 pt-4">
                  <div className="flex justify-between font-inter text-xs text-bloom-taupe">
                    <span>Subtotal</span>
                    <span>{formatKes(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-inter text-xs text-bloom-taupe">
                    <span>Delivery (Nairobi)</span>
                    <span>{formatKes(DELIVERY_FEE)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-bloom-sage-light/30 pt-3">
                    <span className="font-inter text-xs uppercase tracking-[0.14em] text-bloom-charcoal">Total</span>
                    <span className="font-cormorant text-2xl font-light text-bloom-charcoal">{formatKes(total)}</span>
                  </div>
                </div>

                {apiError && (
                  <div className="mt-4 border border-rose-300 bg-rose-50 px-4 py-3">
                    <p className="font-inter text-xs text-rose-600">{apiError}</p>
                  </div>
                )}

                <motion.button
                  type="submit"
                  id="place-order-btn"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="group relative mt-6 flex w-full items-center justify-center overflow-hidden bg-bloom-charcoal py-4 font-inter text-sm font-medium uppercase tracking-[0.2em] text-bloom-cream transition-all duration-500 disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {submitting ? "Placing Order…" : "Place Order"}
                  </span>
                  {!submitting && (
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </motion.button>

                <p className="font-inter mt-4 text-center text-[11px] leading-relaxed text-bloom-taupe">
                  By placing your order, you agree to our delivery terms. Payment is confirmed on M-Pesa receipt.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
