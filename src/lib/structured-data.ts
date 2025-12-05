import type { Product } from "@/types/product";

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  // Fallback for production
  return "https://ecom-one-sandy.vercel.app";
}

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${cleanPath}`;
}

export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Janakpur Art and Craft",
    description: "Handcrafted Mithila artistry from Janakpur, Nepal. Since 1993, we've championed artisan communities through traditional Madhubani paintings, textiles, and decor.",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    foundingDate: "1993",
    founder: {
      "@type": "Person",
      name: "Ajit Kumar Sah",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Janakpur",
      addressCountry: "NP",
    },
    sameAs: [
      // Add social media links when available
    ],
  };
}

export function generateWebSiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Janakpur Art and Craft",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProductSchema(product: Product) {
  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const imageUrl = product.images.length > 0 ? product.images[0] : undefined;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - Handcrafted Mithila art from Janakpur, Nepal`,
    image: product.images,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Janakpur Art and Craft",
    },
    category: product.category?.name || "Mithila Art",
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Janakpur Art and Craft",
      },
    },
    ...(product.artisan && {
      manufacturer: {
        "@type": "Organization",
        name: product.artisan.name,
        ...(product.artisan.location && {
          address: {
            "@type": "PostalAddress",
            addressLocality: product.artisan.location,
            addressCountry: "NP",
          },
        }),
      },
    }),
  };
}

export function generateCollectionPageSchema(products: Product[]) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Handcrafted Treasures",
    description: "Browse the full Janakpur Art and Craft collection—hand-painted wall plates, story scrolls, jewellery, textiles, and decor crafted in Janakpur.",
    url: `${baseUrl}/products`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          url: `${baseUrl}/products/${product.slug}`,
          image: product.images[0],
        },
      })),
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

