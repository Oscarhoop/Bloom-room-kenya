"use client";

import { motion } from "framer-motion";

const TRUST_ITEMS = [
  {
    icon: "🌿",
    title: "Farm-Fresh Daily",
    body: "Every stem is sourced fresh each morning from our partner farms in Limuru and the Rift Valley.",
  },
  {
    icon: "🚗",
    title: "Same-Day Nairobi",
    body: "Order before 1 PM for same-day delivery Monday through Saturday, anywhere in Nairobi.",
  },
  {
    icon: "✂️",
    title: "Hand-Arranged",
    body: "Each arrangement is crafted by our artisan florists — never mass-produced or pre-packaged.",
  },
  {
    icon: "🎁",
    title: "Themed Collections",
    body: "From money bouquets to baby showers, find perfect arrangements for every special occasion.",
  },
] as const;

export default function TrustStrip() {
  return (
    <section className="bg-bloom-parchment px-6 py-20 sm:px-12 lg:px-24 lg:py-24" aria-label="Why Bloom Room Kenya">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="font-inter mb-2 text-[10px] uppercase tracking-[0.26em] text-bloom-sage">
            The Bloom Room Difference
          </p>
          <h2 className="font-cormorant text-4xl font-light text-bloom-charcoal sm:text-5xl">
            Why Choose Us
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(({ icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center"
            >
              <span className="mb-4 text-4xl" aria-hidden="true">{icon}</span>
              <div className="mb-3 h-px w-8 bg-bloom-gold" />
              <h3 className="font-cormorant mb-2 text-xl font-light text-bloom-charcoal">{title}</h3>
              <p className="font-inter text-sm leading-relaxed text-bloom-taupe">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
