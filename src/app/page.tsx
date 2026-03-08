import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrustStrip from "@/components/home/TrustStrip";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <TrustStrip />
    </main>
  );
}
