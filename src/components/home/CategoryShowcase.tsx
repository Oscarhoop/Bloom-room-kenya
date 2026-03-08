import Link from "next/link";
import { prisma } from "@/lib/prisma";

// ─── Category Showcase ─────────────────────────────────────────────────────────

export default async function CategoryShowcase() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 3,
    include: {
      _count: { select: { products: true } },
    },
  });

  if (categories.length === 0) return null;

  // Visual layout: large left card + two stacked right cards
  const [primary, ...secondary] = categories;

  return (
    <section
      className="bg-bloom-cream px-6 py-20 sm:px-12 lg:px-24 lg:py-28"
      aria-labelledby="categories-heading"
    >
      {/* Header */}
      <div className="mx-auto mb-12 max-w-7xl">
        <p className="font-inter mb-2 text-[10px] uppercase tracking-[0.26em] text-bloom-sage">
          Explore
        </p>
        <h2
          id="categories-heading"
          className="font-cormorant text-4xl font-light text-bloom-charcoal sm:text-5xl"
        >
          Shop by Occasion
        </h2>
        <div className="mt-6 h-px w-16 bg-bloom-gold" />
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Primary Large Card */}
          {primary && (
            <Link
              href={`/shop?category=${primary.slug}`}
              className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden bg-bloom-parchment p-8 lg:min-h-[480px]"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-t from-bloom-charcoal/60 via-bloom-charcoal/10 to-transparent transition-opacity duration-500 group-hover:from-bloom-charcoal/70" />
              <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:opacity-15">
                🌸
              </div>

              {/* Text */}
              <div className="relative z-10">
                <p className="font-inter mb-1 text-[10px] uppercase tracking-[0.22em] text-bloom-cream/70">
                  {primary._count.products} arrangements
                </p>
                <h3 className="font-cormorant mb-3 text-3xl font-light text-bloom-cream sm:text-4xl">
                  {primary.name}
                </h3>
                {primary.description && (
                  <p className="font-inter mb-4 text-sm leading-relaxed text-bloom-cream/80">
                    {primary.description}
                  </p>
                )}
                <span className="font-inter inline-block border border-bloom-cream/60 px-5 py-2 text-xs uppercase tracking-[0.16em] text-bloom-cream transition-all duration-300 group-hover:bg-bloom-cream group-hover:text-bloom-charcoal">
                  Explore →
                </span>
              </div>
            </Link>
          )}

          {/* Secondary Cards stacked */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {secondary.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative flex min-h-[140px] flex-col justify-end overflow-hidden bg-bloom-parchment p-6 lg:min-h-0 lg:flex-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-bloom-charcoal/55 via-bloom-charcoal/10 to-transparent transition-opacity duration-500 group-hover:from-bloom-charcoal/65" />
                <div className="absolute inset-0 flex items-center justify-center text-[80px] opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:opacity-15">
                  🌿
                </div>
                <div className="relative z-10">
                  <p className="font-inter mb-0.5 text-[10px] uppercase tracking-[0.2em] text-bloom-cream/70">
                    {cat._count.products} arrangements
                  </p>
                  <h3 className="font-cormorant text-2xl font-light text-bloom-cream sm:text-3xl">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View all CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="font-inter inline-block border border-bloom-charcoal px-8 py-3 text-xs uppercase tracking-[0.18em] text-bloom-charcoal transition-all duration-300 hover:bg-bloom-charcoal hover:text-bloom-cream"
          >
            Browse All Arrangements
          </Link>
        </div>
      </div>
    </section>
  );
}
