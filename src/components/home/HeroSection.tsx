"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.3,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94], // custom cubic-bezier for soft landing
    },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.6 },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut", delay: 1 },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  /** Override the headline text */
  headline?: string;
  /** Override the sub-headline */
  subHeadline?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroSection({
  headline = "Flowers That\nSpeak Volumes.",
  subHeadline = "Beautiful flower arrangements & unique gifts, curated for Nairobi's most meaningful moments. Delivered with care.",
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Subtle parallax on the hero image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-bloom-cream"
      aria-label="Hero section"
    >
      {/* ── Background Image with Parallax ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: imageY }}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <Image
          src="/hero-flowers.png"
          alt="Luxury floral arrangement — blush peonies and white garden roses on cream linen"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient overlay — left-to-right for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-bloom-cream/90 via-bloom-cream/60 to-bloom-cream/10" />
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bloom-cream to-transparent" />
      </motion.div>

      {/* ── Content ── */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32">
        <motion.div
          className="max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow label */}
          <motion.div
            className="mb-8 flex items-center gap-4"
            variants={fadeInVariants}
          >
            <span className="font-inter text-xs font-medium uppercase tracking-[0.22em] text-bloom-sage">
              Nairobi&apos;s Luxury Florist
            </span>
            <motion.div
              className="h-px w-10 origin-left bg-bloom-sage"
              variants={lineVariants}
            />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="font-cormorant text-5xl font-light leading-[1.12] text-bloom-charcoal sm:text-6xl lg:text-7xl xl:text-8xl"
            variants={fadeUpVariants}
          >
            {headline.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </motion.h1>

          {/* Decorative rule */}
          <motion.div
            className="my-8 h-px w-16 origin-left bg-bloom-gold"
            variants={lineVariants}
          />

          {/* Sub-headline */}
          <motion.p
            className="font-inter max-w-md text-base font-light leading-relaxed text-bloom-charcoal/75 sm:text-lg"
            variants={fadeUpVariants}
          >
            {subHeadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-12 flex flex-wrap items-center gap-4"
            variants={fadeUpVariants}
          >
            {/* Primary CTA */}
            <Link
              href="/shop"
              id="hero-cta-primary"
              className="group relative overflow-hidden border border-bloom-charcoal bg-bloom-charcoal px-8 py-3.5 font-inter text-sm font-medium uppercase tracking-[0.16em] text-bloom-cream transition-all duration-500 hover:bg-transparent hover:text-bloom-charcoal"
              aria-label="Browse our floral collections"
            >
              <span className="relative z-10">Shop Collections</span>
              {/* slide-in hover fill */}
              <span className="absolute inset-0 -translate-x-full bg-bloom-cream transition-transform duration-500 ease-in-out group-hover:translate-x-0" />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/custom-orders"
              id="hero-cta-secondary"
              className="font-inter text-sm font-medium uppercase tracking-[0.16em] text-bloom-charcoal/80 underline-offset-4 transition-all duration-300 hover:text-bloom-sage hover:underline"
              aria-label="Request a custom arrangement"
            >
              Custom Orders →
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Trust Badges ── */}
        <motion.div
          className="absolute bottom-12 left-6 right-6 flex flex-wrap items-center gap-6 sm:left-12 lg:left-24 xl:left-32"
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
        >
          {TRUST_BADGES.map(({ id, icon, label }) => (
            <div key={id} className="flex items-center gap-2.5 text-bloom-charcoal/60">
              <span className="text-bloom-sage" aria-hidden="true">
                {icon}
              </span>
              <span className="font-inter text-xs font-medium uppercase tracking-[0.14em]">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Floating accent circle ── */}
      <motion.div
        className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-bloom-blush/20 blur-3xl"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
        aria-hidden="true"
      />
    </section>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TRUST_BADGES = [
  {
    id: "same-day",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    label: "Same-Day Delivery",
  },
  {
    id: "premium",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    label: "Premium Blooms",
  },
  {
    id: "gifts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13" />
        <path d="M19 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2" />
        <path d="M12 8a3 3 0 0 1 0-6 3 3 0 0 1 0 6" />
        <path d="M12 8a3 3 0 0 0 0-6 3 3 0 0 0 0 6" />
      </svg>
    ),
    label: "Gifts & Flowers",
  },
  {
    id: "nairobi",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Nairobi-Wide",
  },
] as const;
