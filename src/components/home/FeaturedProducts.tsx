import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";

// ─── Featured Products ─────────────────────────────────────────────────────────

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // Fallback: if no featured products, grab the 4 newest
  const display =
    products.length > 0
      ? products
      : await prisma.product.findMany({
          where: { isAvailable: true },
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { createdAt: "desc" },
          take: 4,
        });

  if (display.length === 0) return null;

  return (
    <section className="bg-bloom-cream px-6 py-20 sm:px-12 lg:px-24 lg:py-28" aria-labelledby="featured-heading">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-inter mb-2 text-[10px] uppercase tracking-[0.26em] text-bloom-sage">
              Curated Selection
            </p>
            <h2
              id="featured-heading"
              className="font-cormorant text-4xl font-light text-bloom-charcoal sm:text-5xl"
            >
              Featured Arrangements
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-inter self-start text-xs uppercase tracking-[0.18em] text-bloom-taupe underline-offset-4 transition-colors hover:text-bloom-charcoal hover:underline sm:self-auto"
          >
            View all →
          </Link>
        </div>
        {/* Thin gold divider */}
        <div className="mt-6 h-px w-16 bg-bloom-gold" />
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {display.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              priceKes={product.priceKes}
              comparePriceKes={product.comparePriceKes}
              thumbnailUrl={product.thumbnailUrl}
              imageUrls={product.imageUrls}
              shortDescription={product.shortDescription}
              isNew={product.isNew}
              isBestSeller={product.isBestSeller}
              categoryName={product.category.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
