import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/shop/ProductDetail";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });
}

// ─── Dynamic SEO ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Bloom Room Kenya`,
    description: product.metaDescription ?? product.shortDescription ?? product.description,
    openGraph: {
      title: `${product.name} | Bloom Room Kenya`,
      description: product.metaDescription ?? product.description,
      images: product.imageUrls.length > 0 ? [{ url: product.imageUrls[0] }] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isAvailable) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
