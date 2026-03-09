"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // 👉 The Proxy Fix: Wrap every image URL to bypass Instagram's 403 block
  const proxiedImages = images.map(
    (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1000`
  );

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {proxiedImages.length > 1 && (
        <div className="flex gap-4 lg:flex-col lg:w-20">
          {proxiedImages.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative aspect-square w-20 overflow-hidden border transition-all ${
                selectedIdx === idx ? "border-bloom-sage" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={url} alt={`${productName} thumbnail ${idx}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-bloom-parchment">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            src={proxiedImages[selectedIdx]}
            alt={productName}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}