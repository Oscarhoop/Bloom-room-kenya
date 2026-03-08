"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.3}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.3}
      stroke="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice());

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-bloom-charcoal/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Panel ── */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#faf9f6] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bloom-sage-light/30 px-6 py-5">
              <div>
                <h2 className="font-cormorant text-2xl font-light text-bloom-charcoal">
                  Your Order
                </h2>
                <p className="font-inter mt-0.5 text-[11px] uppercase tracking-[0.16em] text-bloom-taupe">
                  {items.length === 0
                    ? "No items yet"
                    : `${items.reduce((s, i) => s + i.quantity, 0)} item${items.reduce((s, i) => s + i.quantity, 0) === 1 ? "" : "s"}`}
                </p>
              </div>
              <button
                onClick={closeCart}
                id="cart-close-btn"
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center text-bloom-charcoal/50 transition-colors hover:text-bloom-charcoal"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <ul className="flex flex-col divide-y divide-bloom-sage-light/20" role="list">
                  {items.map((item) => {
                    const isExternal = item.imageUrl?.startsWith("http") ?? false;
                    return (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4 py-5"
                      >
                        {/* Image */}
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-bloom-parchment">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="80px"
                              unoptimized={isExternal}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              🌸
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/shop/${item.slug}`}
                              onClick={closeCart}
                              className="font-cormorant text-base font-light leading-snug text-bloom-charcoal hover:text-bloom-sage-dark transition-colors"
                            >
                              {item.name}
                            </Link>
                            {(item.selectedColor || item.selectedSize) && (
                              <p className="font-inter mt-0.5 text-[11px] capitalize text-bloom-taupe">
                                {[item.selectedColor, item.selectedSize]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                            <p className="font-inter mt-1 text-sm text-bloom-charcoal">
                              {formatKes(item.priceKes)}
                            </p>
                          </div>

                          {/* Quantity + Remove */}
                          <div className="mt-2 flex items-center gap-4">
                            {/* Stepper */}
                            <div className="flex items-center border border-bloom-sage-light/50">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label={`Decrease quantity of ${item.name}`}
                                className="flex h-7 w-7 items-center justify-center text-sm text-bloom-charcoal/60 transition-colors hover:bg-bloom-parchment hover:text-bloom-charcoal"
                              >
                                −
                              </button>
                              <span className="font-inter w-6 text-center text-xs text-bloom-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.name}`}
                                className="flex h-7 w-7 items-center justify-center text-sm text-bloom-charcoal/60 transition-colors hover:bg-bloom-parchment hover:text-bloom-charcoal"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="flex items-center gap-1 font-inter text-[11px] uppercase tracking-[0.12em] text-bloom-taupe transition-colors hover:text-rose-500"
                            >
                              <TrashIcon />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <p className="font-inter shrink-0 text-sm text-bloom-charcoal">
                          {formatKes(item.priceKes * item.quantity)}
                        </p>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-bloom-sage-light/30 bg-[#faf9f6] px-6 pb-8 pt-5">
                {/* Subtotal */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-inter text-xs uppercase tracking-[0.16em] text-bloom-taupe">
                    Subtotal
                  </span>
                  <span className="font-cormorant text-2xl font-light text-bloom-charcoal">
                    {formatKes(totalPrice)}
                  </span>
                </div>

                <p className="font-inter mb-4 text-center text-[11px] leading-relaxed text-bloom-taupe">
                  Delivery fee calculated at checkout · Mon – Sat delivery
                </p>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  id="cart-checkout-btn"
                  onClick={closeCart}
                  className="group relative flex w-full items-center justify-center overflow-hidden bg-bloom-charcoal py-4 font-inter text-sm font-medium uppercase tracking-[0.2em] text-bloom-cream transition-all duration-500 hover:bg-bloom-sage-dark"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />
                </Link>

                <button
                  onClick={closeCart}
                  className="font-inter mt-3 w-full text-center text-xs uppercase tracking-[0.14em] text-bloom-taupe underline-offset-4 transition-colors hover:text-bloom-charcoal hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 text-5xl" aria-hidden="true">🌿</div>
      <h3 className="font-cormorant mb-2 text-2xl font-light text-bloom-charcoal">
        Your order is empty
      </h3>
      <p className="font-inter mb-6 max-w-xs text-sm leading-relaxed text-bloom-taupe">
        Explore our curated collection of premium floral arrangements.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        className="font-inter border border-bloom-charcoal px-6 py-3 text-xs uppercase tracking-[0.18em] text-bloom-charcoal transition-all duration-300 hover:bg-bloom-charcoal hover:text-bloom-cream"
      >
        Browse the Shop
      </Link>
    </div>
  );
}
