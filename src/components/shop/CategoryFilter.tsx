"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeSlug = searchParams.get("category") ?? "all";

  const allTabs: { id: string; name: string; slug: string }[] = [
    { id: "all", name: "All", slug: "all" },
    ...categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  ];

  function handleSelect(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <nav
      className="relative flex w-full items-start gap-1 overflow-x-auto pb-1"
      aria-label="Filter products by category"
    >
      {allTabs.map((tab) => {
        const isActive = tab.slug === activeSlug;
        return (
          <button
            key={tab.id}
            id={`filter-${tab.slug}`}
            onClick={() => handleSelect(tab.slug)}
            disabled={isPending}
            aria-pressed={isActive}
            className={`group relative shrink-0 px-5 py-2.5 font-inter text-xs font-medium uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-sage focus-visible:ring-offset-2 disabled:opacity-60 ${
              isActive
                ? "text-bloom-charcoal"
                : "text-bloom-taupe hover:text-bloom-charcoal"
            }`}
          >
            {tab.name}

            {/* Animated underline indicator */}
            {isActive && (
              <motion.span
                layoutId="category-indicator"
                className="absolute bottom-0 left-0 right-0 h-px bg-bloom-charcoal"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            {!isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-px scale-x-0 bg-bloom-sage-light transition-transform duration-300 group-hover:scale-x-100" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
