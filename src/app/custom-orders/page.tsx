"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

// ─── Custom Order Themes ────────────────────────────────────────────────────

const THEMES = [
  {
    id: "money-bouquet",
    name: "Money Bouquet",
    description: "Fresh flowers artfully arranged with cash gifts — perfect for graduations, birthdays, or celebrations.",
    emoji: "💵",
    priceFrom: "Ksh 3,500",
    popular: true,
    occasions: ["Birthday", "Graduation", "Congratulations"],
  },
  {
    id: "baby-shower",
    name: "Baby Shower Bouquet",
    description: "Soft pastels and gentle blooms in pink or blue themes — ready for gender reveals or baby welcomes.",
    emoji: "👶",
    priceFrom: "Ksh 2,500",
    popular: true,
    occasions: ["Baby Shower", "Gender Reveal", "New Baby"],
  },
  {
    id: "anniversary",
    name: "Anniversary Arrangement",
    description: "Romantic roses and premium blooms to celebrate your special milestone together.",
    emoji: "💕",
    priceFrom: "Ksh 4,000",
    popular: false,
    occasions: ["Anniversary", "Wedding", "Romance"],
  },
  {
    id: "corporate",
    name: "Corporate Gift",
    description: "Elegant, professional arrangements for office celebrations, client gifts, or employee recognition.",
    emoji: "💼",
    priceFrom: "Ksh 5,000",
    popular: false,
    occasions: ["Corporate", "Client Gift", "Promotion"],
  },
  {
    id: "sympathy",
    name: "Sympathy Flowers",
    description: "Tasteful white and pastel arrangements to express condolences and support.",
    emoji: "🕊️",
    priceFrom: "Ksh 3,000",
    popular: false,
    occasions: ["Funeral", "Condolences", "Get Well"],
  },
  {
    id: "birthday",
    name: "Birthday Special",
    description: "Vibrant, joyful blooms with optional balloons and chocolates add-ons.",
    emoji: "🎂",
    priceFrom: "Ksh 2,000",
    popular: true,
    occasions: ["Birthday", "Milestone", "Celebration"],
  },
] as const;

// ─── Form State ──────────────────────────────────────────────────────────────

interface OrderForm {
  theme: string;
  name: string;
  phone: string;
  email: string;
  occasion: string;
  budget: string;
  deliveryDate: string;
  recipientLocation: string;
  specialRequests: string;
}

const BUDGETS = [
  "Ksh 2,000 – 5,000",
  "Ksh 5,000 – 10,000",
  "Ksh 10,000 – 20,000",
  "Ksh 20,000+",
] as const;

const INITIAL: OrderForm = {
  theme: "",
  name: "",
  phone: "",
  email: "",
  occasion: "",
  budget: "",
  deliveryDate: "",
  recipientLocation: "",
  specialRequests: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="font-inter mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">
      {children}
    </label>
  );
}

function Input({ id, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  return (
    <div>
      <input
        id={id}
        {...props}
        className={`font-inter w-full border bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal placeholder:text-bloom-taupe/50 transition-all duration-200 focus:bg-bloom-cream focus:outline-none ${
          error ? "border-rose-400" : "border-bloom-sage-light/50 focus:border-bloom-charcoal"
        }`}
      />
      {error && <p className="font-inter mt-1 text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomOrdersPage() {
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [form, setForm] = useState<OrderForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<OrderForm>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function selectTheme(themeId: string) {
    setSelectedTheme(themeId);
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) {
      set("theme", theme.name);
    }
    setErrors((prev) => ({ ...prev, theme: undefined }));
  }

  function validate(): boolean {
    const e: Partial<OrderForm> = {};
    if (!selectedTheme) e.theme = "Please select a theme";
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.occasion.trim()) e.occasion = "Please tell us the occasion";
    if (!form.budget) e.budget = "Please select a budget range";
    if (!form.deliveryDate) e.deliveryDate = "Please select a delivery date";
    if (!form.recipientLocation.trim()) e.recipientLocation = "Required for delivery";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    
    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: form.theme,
          name: form.name,
          phone: form.phone,
          email: form.email,
          occasion: form.occasion,
          budget: form.budget,
          deliveryDate: form.deliveryDate,
          recipientLocation: form.recipientLocation,
          specialRequests: form.specialRequests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : "Failed to submit order. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-bloom-cream">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-bloom-charcoal px-6 pt-36 pb-20 sm:px-12 lg:px-24">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-5 select-none">
          <span className="text-[30vw] leading-none">🌸</span>
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-inter mb-3 text-[10px] uppercase tracking-[0.3em] text-bloom-sage">
            Special Requests
          </p>
          <h1 className="font-cormorant mb-6 text-5xl font-light leading-tight text-bloom-cream sm:text-6xl lg:text-7xl">
            Custom Orders
          </h1>
          <p className="font-inter mx-auto max-w-xl text-base leading-relaxed text-bloom-cream/70">
            From money bouquets to baby shower themes — tell us what you need and we&apos;ll create something beautiful.
          </p>
        </div>
      </section>

      {/* ── Theme Selection ── */}
      <section className="px-6 py-20 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="font-inter mb-2 text-[10px] uppercase tracking-[0.26em] text-bloom-sage">Choose Your Style</p>
            <h2 className="font-cormorant text-4xl font-light text-bloom-charcoal sm:text-5xl">Popular Themes</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((theme, i) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => selectTheme(theme.id)}
                className={`cursor-pointer border p-6 transition-all duration-300 ${
                  selectedTheme === theme.id
                    ? "border-bloom-charcoal bg-bloom-parchment"
                    : "border-bloom-sage-light/40 hover:border-bloom-sage"
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-4xl">{theme.emoji}</span>
                  {theme.popular && (
                    <span className="font-inter bg-bloom-blush px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-bloom-charcoal">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="font-cormorant mb-2 text-2xl font-light text-bloom-charcoal">{theme.name}</h3>
                <p className="font-inter mb-4 text-sm leading-relaxed text-bloom-taupe">{theme.description}</p>
                <div className="flex flex-wrap gap-2">
                  {theme.occasions.map((occ) => (
                    <span
                      key={occ}
                      className="font-inter text-[10px] uppercase tracking-[0.12em] text-bloom-sage"
                    >
                      {occ}
                    </span>
                  ))}
                </div>
                <p className="font-cormorant mt-4 text-lg text-bloom-charcoal">From {theme.priceFrom}</p>
              </motion.div>
            ))}
          </div>
          {errors.theme && (
            <p className="font-inter mt-6 text-center text-[12px] text-rose-500">{errors.theme}</p>
          )}
        </div>
      </section>

      {/* ── Order Form ── */}
      <section id="order-form" className="bg-bloom-parchment/60 px-6 py-20 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="font-inter mb-2 text-[10px] uppercase tracking-[0.26em] text-bloom-sage">Place Your Order</p>
            <h2 className="font-cormorant text-4xl font-light text-bloom-charcoal sm:text-5xl">Request Custom Arrangement</h2>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-bloom-sage/30 bg-bloom-sage/10 p-10 text-center"
            >
              <div className="mb-4 text-4xl">🌿</div>
              <h3 className="font-cormorant mb-2 text-3xl font-light text-bloom-charcoal">Order Received</h3>
              <p className="font-inter text-sm leading-relaxed text-bloom-taupe">
                Thank you, {form.name}! We&apos;ll call you within 24 hours to confirm your {form.theme} order.
              </p>
              <Link href="/" className="font-inter mt-6 inline-block text-xs uppercase tracking-[0.18em] text-bloom-sage underline-offset-4 hover:underline">
                Return Home
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              {/* Selected Theme Display */}
              {selectedTheme && (
                <div className="border border-bloom-sage/30 bg-bloom-sage/10 p-4">
                  <p className="font-inter text-[10px] uppercase tracking-[0.18em] text-bloom-sage mb-1">Selected Theme</p>
                  <p className="font-cormorant text-xl text-bloom-charcoal">
                    {THEMES.find((t) => t.id === selectedTheme)?.emoji} {THEMES.find((t) => t.id === selectedTheme)?.name}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="order-name">Your Name *</Label>
                  <Input id="order-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" error={errors.name} />
                </div>
                <div>
                  <Label htmlFor="order-phone">Phone Number *</Label>
                  <Input id="order-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0712 345 678" error={errors.phone} />
                </div>
              </div>

              <div>
                <Label htmlFor="order-email">Email Address *</Label>
                <Input id="order-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" error={errors.email} />
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="order-occasion">Occasion *</Label>
                  <Input id="order-occasion" value={form.occasion} onChange={(e) => set("occasion", e.target.value)} placeholder="e.g. Sister's Graduation" error={errors.occasion} />
                </div>
                <div>
                  <Label htmlFor="order-budget">Your Budget (Ksh) *</Label>
                  <Input 
                    id="order-budget" 
                    type="text" 
                    value={form.budget} 
                    onChange={(e) => set("budget", e.target.value)} 
                    placeholder="e.g. 5,000 or 3,500" 
                    error={errors.budget} 
                  />
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="order-date">Delivery Date *</Label>
                  <Input 
                    id="order-date" 
                    type="date" 
                    value={form.deliveryDate} 
                    onChange={(e) => set("deliveryDate", e.target.value)} 
                    min={new Date().toISOString().split("T")[0]}
                    error={errors.deliveryDate} 
                  />
                </div>
                <div>
                  <Label htmlFor="order-location">Delivery Location *</Label>
                  <Input id="order-location" value={form.recipientLocation} onChange={(e) => set("recipientLocation", e.target.value)} placeholder="e.g. Westlands, Nairobi" error={errors.recipientLocation} />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <Label htmlFor="order-requests">Special Requests (optional)</Label>
                <textarea
                  id="order-requests"
                  rows={4}
                  maxLength={500}
                  value={form.specialRequests}
                  onChange={(e) => set("specialRequests", e.target.value)}
                  placeholder="Specific colours, flower preferences, amount of money to include, or any other details..."
                  className="font-inter w-full resize-none border bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal placeholder:text-bloom-taupe/50 focus:bg-bloom-cream focus:outline-none border-bloom-sage-light/50 focus:border-bloom-charcoal"
                />
                <p className="font-inter mt-1 text-right text-[11px] text-bloom-taupe">{form.specialRequests.length} / 500</p>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-bloom-charcoal py-4 font-inter text-sm uppercase tracking-[0.2em] text-bloom-cream transition-all duration-300 disabled:opacity-60 mt-4"
              >
                <span className="relative z-10">{submitting ? "Sending…" : "Submit Order Request"}</span>
                {!submitting && (
                  <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </motion.button>

              <p className="font-inter text-center text-[11px] text-bloom-taupe">
                We&apos;ll call you within 24 hours to confirm details and arrange payment.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
