"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  priceKes: number;
  comparePriceKes?: number | null;
  thumbnailUrl?: string | null;
  imageUrls: string[];
  shortDescription?: string | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  categoryName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKes(amountKes: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountKes);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductCard({
  id,
  slug,
  name,
  priceKes,
  comparePriceKes,
  thumbnailUrl,
  imageUrls,
  shortDescription,
  isNew,
  isBestSeller,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAddToOrder(e: React.MouseEvent) {
    e.preventDefault(); // don't follow the card link
    addItem({ id, slug, name, priceKes, imageUrl: thumbnailUrl ?? imageUrls[0] ?? null });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }
  const imageSrc = thumbnailUrl ?? imageUrls[0] ?? null;
  const isExternal = imageSrc?.startsWith("http");
  const discount =
    comparePriceKes && comparePriceKes > priceKes
      ? Math.round(((comparePriceKes - priceKes) / comparePriceKes) * 100)
      : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col bg-bloom-cream"
    >
      <Link href={`/shop/${slug}`} className="block overflow-hidden" aria-label={`View ${name}`}>
        {/* Product Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-bloom-parchment">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={isExternal}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {isNew && (
              <span className="font-inter bg-bloom-sage px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-bloom-cream">
                New
              </span>
            )}
            {isBestSeller && (
              <span className="font-inter bg-bloom-charcoal px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-bloom-cream">
                Best Seller
              </span>
            )}
            {discount && (
              <span className="font-inter bg-bloom-blush px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-bloom-charcoal">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick-view overlay */}
          <div className="absolute inset-0 flex items-end justify-center bg-bloom-charcoal/0 pb-6 opacity-0 transition-all duration-500 group-hover:bg-bloom-charcoal/10 group-hover:opacity-100">
            <span className="font-inter translate-y-3 border border-bloom-cream/80 bg-bloom-cream/80 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-bloom-charcoal backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-0">
              View Details
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-4 px-1">
          <p className="font-inter mb-1 text-[10px] uppercase tracking-[0.18em] text-bloom-sage">
            {/* Category label passed from parent */}
          </p>
          <h3 className="font-cormorant text-lg font-light leading-snug text-bloom-charcoal transition-colors duration-300 group-hover:text-bloom-sage-dark">
            {name}
          </h3>

          {shortDescription && (
            <p className="font-inter mt-1.5 line-clamp-2 text-xs leading-relaxed text-bloom-taupe">
              {shortDescription}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <span className="font-inter text-sm font-medium text-bloom-charcoal">
              {formatKes(priceKes)}
            </span>
            {comparePriceKes && comparePriceKes > priceKes && (
              <span className="font-inter text-xs text-bloom-taupe line-through">
                {formatKes(comparePriceKes)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Order button */}
      <motion.button
        onClick={handleAddToOrder}
        whileTap={{ scale: 0.97 }}
        id={`add-to-cart-${slug}`}
        aria-label={`Add ${name} to order`}
        className={`font-inter mt-4 w-full py-3 text-xs font-medium uppercase tracking-[0.16em] transition-all duration-300 ${
          added
            ? "bg-bloom-sage text-bloom-cream"
            : "border border-bloom-charcoal/20 bg-transparent text-bloom-charcoal/70 hover:border-bloom-charcoal hover:bg-bloom-charcoal hover:text-bloom-cream"
        }`}
      >
        {added ? "✓ Added" : "Add to Order"}
      </motion.button>
    </motion.article>
  );
}
