import { getFeaturedProducts } from "@/lib/product-service";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { HeroSection } from "@/components/home/hero-section";
import { StorySection } from "@/components/home/story-section";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="space-y-24 pb-24">
      <HeroSection />
      <StorySection />
      <FeaturedProductsSection products={featuredProducts} />
    </div>
  );
}
