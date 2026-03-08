import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import ProductCard from "@/components/shop/ProductCard";
import CategoryFilter from "@/components/shop/CategoryFilter";
import type { Metadata } from "next";

// ─── SEO ─────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Shop — Bloom Room Kenya | Flower & Gift Collections",
  description:
    "Browse our curated collection of luxury bouquets, themed arrangements, and unique gifts. Premium floristry, Nairobi-wide delivery.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

async function getProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      isAvailable: true,
      ...(categorySlug && categorySlug !== "all"
        ? { category: { slug: categorySlug } }
        : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { isBestSeller: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      priceKes: true,
      comparePriceKes: true,
      thumbnailUrl: true,
      imageUrls: true,
      shortDescription: true,
      isNew: true,
      isBestSeller: true,
      category: { select: { name: true } },
    },
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(category),
  ]);

  const activeCategory =
    category && category !== "all"
      ? categories.find((c) => c.slug === category)?.name ?? "All Products"
      : "All Products";

  return (
    <main className="min-h-screen bg-bloom-cream">
      {/* ── Page Header ── */}
      <div className="border-b border-bloom-sage-light/40 bg-bloom-parchment px-6 pb-0 pt-32 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <p className="font-inter mb-3 text-xs uppercase tracking-[0.22em] text-bloom-sage">
            Bloom Room Kenya
          </p>
          <h1 className="font-cormorant text-5xl font-light text-bloom-charcoal lg:text-6xl">
            {activeCategory}
          </h1>
          <p className="font-inter mt-3 max-w-md text-sm leading-relaxed text-bloom-taupe">
            Every arrangement is hand-crafted with the finest seasonal blooms, prepared for Nairobi&apos;s most meaningful moments.
          </p>

          {/* Category Filter */}
          <div className="mt-8">
            <Suspense>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-24">
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="font-inter mb-10 text-xs uppercase tracking-[0.16em] text-bloom-taupe">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
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
          </>
        )}
      </div>
    </main>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 text-5xl" aria-hidden="true">🌿</div>
      <h2 className="font-cormorant mb-3 text-3xl font-light text-bloom-charcoal">
        Nothing here yet
      </h2>
      <p className="font-inter max-w-xs text-sm leading-relaxed text-bloom-taupe">
        This collection is being curated. Please check back soon or explore another category.
      </p>
    </div>
  );
}
