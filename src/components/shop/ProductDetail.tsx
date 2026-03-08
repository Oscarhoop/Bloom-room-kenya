"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ImageGallery from "@/components/shop/ImageGallery";
import { useCartStore } from "@/store/useCartStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  priceKes: number;
  comparePriceKes: number | null;
  imageUrls: string[];
  thumbnailUrl: string | null;
  availableColors: string[];
  availableSizes: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isInStock: boolean;
  sku: string;
  category: { name: string; slug: string };
}

interface ProductDetailProps {
  product: Product;
}

interface OrderState {
  selectedColor: string;
  selectedSize: string;
  deliveryDate: string;       // ISO date string "YYYY-MM-DD"
  isGift: boolean;
  giftMessage: string;
  quantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Returns today's date as "YYYY-MM-DD" */
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Returns true if the given date string falls on a Sunday */
function isSunday(dateStr: string): boolean {
  return new Date(dateStr).getDay() === 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-inter mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-bloom-sage">
      {children}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetail({ product }: ProductDetailProps) {
  const [order, setOrder] = useState<OrderState>({
    selectedColor: product.availableColors[0] ?? "",
    selectedSize: product.availableSizes[0] ?? "",
    deliveryDate: "",
    isGift: false,
    giftMessage: "",
    quantity: 1,
  });
  const addItem = useCartStore((s) => s.addItem);
  const [addedToCart, setAddedToCart] = useState(false);

  const set = useCallback(
    <K extends keyof OrderState>(key: K, value: OrderState[K]) =>
      setOrder((prev) => ({ ...prev, [key]: value })),
    []
  );

  // Date change: validate not Sunday
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val && isSunday(val)) return; // silently block Sundays
    set("deliveryDate", val);
  }

  function handleAddToCart() {
    if (!product.isInStock) return;
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceKes: product.priceKes,
      imageUrl: product.thumbnailUrl ?? product.imageUrls[0] ?? null,
      selectedColor: order.selectedColor || undefined,
      selectedSize: order.selectedSize || undefined,
      quantity: order.quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  const discount =
    product.comparePriceKes && product.comparePriceKes > product.priceKes
      ? Math.round(((product.comparePriceKes - product.priceKes) / product.comparePriceKes) * 100)
      : null;

  return (
    <main className="min-h-screen bg-bloom-cream pt-24">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-6 pb-4 sm:px-12 lg:px-24" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-inter text-xs text-bloom-taupe">
          <li><Link href="/" className="hover:text-bloom-charcoal transition-colors">Home</Link></li>
          <li aria-hidden="true">·</li>
          <li><Link href="/shop" className="hover:text-bloom-charcoal transition-colors">Shop</Link></li>
          <li aria-hidden="true">·</li>
          <li>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-bloom-charcoal transition-colors">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">·</li>
          <li className="text-bloom-charcoal">{product.name}</li>
        </ol>
      </nav>

      {/* Two-column layout */}
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Left: Image Gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ImageGallery
              images={product.imageUrls.length > 0 ? product.imageUrls : []}
              productName={product.name}
            />
          </motion.div>

          {/* ── Right: Product Info & Actions ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="flex flex-col gap-8 pb-16"
          >
            {/* Header */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-inter text-xs uppercase tracking-[0.18em] text-bloom-sage">
                  {product.category.name}
                </span>
                {product.isNew && (
                  <span className="font-inter bg-bloom-sage px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-bloom-cream">
                    New
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="font-inter bg-bloom-blush px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-bloom-charcoal">
                    Best Seller
                  </span>
                )}
              </div>

              <h1 className="font-cormorant text-4xl font-light leading-tight text-bloom-charcoal sm:text-5xl">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="font-inter mt-3 text-sm leading-relaxed text-bloom-taupe">
                  {product.shortDescription}
                </p>
              )}

              {/* Pricing */}
              <div className="mt-5 flex items-baseline gap-4">
                <span className="font-cormorant text-3xl font-light text-bloom-charcoal">
                  {formatKes(product.priceKes)}
                </span>
                {product.comparePriceKes && product.comparePriceKes > product.priceKes && (
                  <>
                    <span className="font-inter text-sm text-bloom-taupe line-through">
                      {formatKes(product.comparePriceKes)}
                    </span>
                    {discount && (
                      <span className="font-inter text-xs font-medium text-bloom-sage-dark">
                        Save {discount}%
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Thin divider */}
              <div className="mt-6 h-px w-12 bg-bloom-gold" />
            </div>

            {/* Full description */}
            <p className="font-inter text-sm leading-relaxed text-bloom-charcoal/80">
              {product.description}
            </p>

            {/* ── Color Selector ── */}
            {product.availableColors.length > 0 && (
              <div>
                <SectionLabel>Colour — {order.selectedColor || "Select"}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      id={`color-${color.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => set("selectedColor", color)}
                      aria-pressed={order.selectedColor === color}
                      className={`font-inter rounded-none border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-all duration-200 ${
                        order.selectedColor === color
                          ? "border-bloom-charcoal bg-bloom-charcoal text-bloom-cream"
                          : "border-bloom-sage-light text-bloom-charcoal hover:border-bloom-charcoal"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Size Selector ── */}
            {product.availableSizes.length > 0 && (
              <div>
                <SectionLabel>Size — {order.selectedSize || "Select"}</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      id={`size-${size.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => set("selectedSize", size)}
                      aria-pressed={order.selectedSize === size}
                      className={`font-inter rounded-none border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-all duration-200 ${
                        order.selectedSize === size
                          ? "border-bloom-charcoal bg-bloom-charcoal text-bloom-cream"
                          : "border-bloom-sage-light text-bloom-charcoal hover:border-bloom-charcoal"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Delivery Date Picker ── */}
            <div>
              <SectionLabel>Delivery Date</SectionLabel>
              <div className="relative">
                <input
                  id="delivery-date"
                  type="date"
                  value={order.deliveryDate}
                  min={todayISO()}
                  onChange={handleDateChange}
                  aria-label="Select a delivery date"
                  className="font-inter w-full border border-bloom-sage-light/60 bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal transition-all duration-200 focus:border-bloom-charcoal focus:bg-bloom-cream focus:outline-none"
                />
              </div>
              <p className="font-inter mt-2 text-[11px] text-bloom-taupe">
                We deliver Monday – Saturday. Past dates and Sundays are not available.
              </p>
            </div>

            {/* ── Gift Message Toggle + Textarea ── */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <div
                  role="checkbox"
                  aria-checked={order.isGift}
                  tabIndex={0}
                  id="is-gift-toggle"
                  onClick={() => set("isGift", !order.isGift)}
                  onKeyDown={(e) => e.key === " " && set("isGift", !order.isGift)}
                  className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ${
                    order.isGift ? "bg-bloom-sage" : "bg-bloom-sage-light/60"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      order.isGift ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="font-inter text-xs uppercase tracking-[0.16em] text-bloom-charcoal">
                  This is a gift
                </span>
              </label>

              {order.isGift && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4">
                    <SectionLabel>Personalised Gift Message</SectionLabel>
                    <textarea
                      id="gift-message"
                      maxLength={280}
                      rows={4}
                      value={order.giftMessage}
                      onChange={(e) => set("giftMessage", e.target.value)}
                      placeholder="Write a heartfelt message for the card... (max. 280 characters)"
                      aria-label="Personalized gift message"
                      className="font-inter w-full resize-none border border-bloom-sage-light/60 bg-bloom-parchment/40 px-4 py-3 text-sm leading-relaxed text-bloom-charcoal placeholder:text-bloom-taupe/70 transition-all duration-200 focus:border-bloom-charcoal focus:bg-bloom-cream focus:outline-none"
                    />
                    <p className="font-inter mt-1.5 text-right text-[11px] text-bloom-taupe">
                      {order.giftMessage.length} / 280
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Quantity ── */}
            <div>
              <SectionLabel>Quantity</SectionLabel>
              <div className="flex w-32 items-center border border-bloom-sage-light/60">
                <button
                  onClick={() => set("quantity", Math.max(1, order.quantity - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-bloom-charcoal/60 transition-colors hover:bg-bloom-parchment hover:text-bloom-charcoal"
                >
                  −
                </button>
                <span className="font-inter flex-1 text-center text-sm text-bloom-charcoal">
                  {order.quantity}
                </span>
                <button
                  onClick={() => set("quantity", order.quantity + 1)}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-bloom-charcoal/60 transition-colors hover:bg-bloom-parchment hover:text-bloom-charcoal"
                >
                  +
                </button>
              </div>
            </div>

            {/* ── Add to Cart CTA ── */}
            <div className="flex flex-col gap-3 pt-2">
              <motion.button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.isInStock}
                whileTap={product.isInStock ? { scale: 0.98 } : {}}
                className={`group relative w-full overflow-hidden py-4 font-inter text-sm font-medium uppercase tracking-[0.2em] transition-all duration-500 ${
                  !product.isInStock
                    ? "cursor-not-allowed border border-bloom-sage-light text-bloom-taupe"
                    : addedToCart
                    ? "bg-bloom-sage text-bloom-cream"
                    : "bg-bloom-charcoal text-bloom-cream hover:bg-bloom-sage-dark"
                }`}
              >
                <span className="relative z-10">
                  {!product.isInStock
                    ? "Out of Stock"
                    : addedToCart
                    ? "✓ Added to Order"
                    : "Add to Order"}
                </span>
                {/* shine sweep on hover */}
                {product.isInStock && !addedToCart && (
                  <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </motion.button>

              <Link
                href="/shop"
                className="font-inter text-center text-xs uppercase tracking-[0.16em] text-bloom-taupe underline-offset-4 transition-colors hover:text-bloom-sage hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* ── Trust Strip ── */}
            <div className="grid grid-cols-2 gap-4 border-t border-bloom-sage-light/30 pt-6">
              {TRUST_ITEMS.map(({ icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-lg text-bloom-sage" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="font-inter text-xs font-medium uppercase tracking-[0.12em] text-bloom-charcoal">
                      {label}
                    </p>
                    <p className="font-inter mt-0.5 text-[11px] leading-snug text-bloom-taupe">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: "🌿", label: "Fresh Guarantee", sub: "Every bloom is sourced and arranged the same morning." },
  { icon: "🚗", label: "Nairobi Delivery", sub: "Same-day delivery available Mon – Sat." },
  { icon: "💌", label: "Gift Messaging", sub: "Handwritten cards included at no extra charge." },
  { icon: "☎️", label: "Customer Care", sub: "Call +254 700 000 000 for any special requests." },
] as const;
