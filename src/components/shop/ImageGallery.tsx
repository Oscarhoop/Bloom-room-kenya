"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const isExternal = hasImages && images[0].startsWith("http");

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-bloom-parchment">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeIndex]}
                alt={`${productName} — image ${activeIndex + 1}`}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={isExternal}
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🌸</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnail Strip — only show if more than one image */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border-b-2 transition-all duration-300 ${
                i === activeIndex
                  ? "border-bloom-charcoal opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                unoptimized={isExternal}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
