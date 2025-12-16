import Script from "next/script";

import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { HeroSection } from "@/components/home/hero-section";
import { StorySection } from "@/components/home/story-section";
import { getFeaturedProducts } from "@/lib/product-service";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="space-y-12 pb-12 sm:space-y-16 sm:pb-16 md:space-y-24 md:pb-24">
        <HeroSection />
        <StorySection />
        <FeaturedProductsSection products={featuredProducts} />
      </div>
    </>
  );
}
