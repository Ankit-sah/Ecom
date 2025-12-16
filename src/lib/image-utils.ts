/**
 * Image utility functions for optimized image loading
 * 
 * Since Vercel Blob URLs are already CDN-backed and public,
 * we leverage Next.js Image component's built-in optimization
 * which automatically handles:
 * - Image resizing
 * - Format conversion (WebP/AVIF)
 * - Lazy loading
 * - Responsive images
 */

/**
 * Check if a URL is a Vercel Blob URL
 */
export function isVercelBlobUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * Get optimized image URL
 * Next.js Image component automatically optimizes images from allowed domains
 * This function can be used for non-Next.js Image scenarios
 */
export function getOptimizedImageUrl(imageUrl: string): string {
  if (!imageUrl) {
    return "";
  }

  // Next.js Image component handles optimization automatically
  // For direct URL usage, return as-is (Vercel Blob URLs are already optimized)
  return imageUrl;
}

/**
 * Get image sizes attribute for responsive images
 * Optimized for different viewport sizes
 */
export function getImageSizes(
  context: "card" | "detail" | "thumbnail" | "hero" = "card"
): string {
  switch (context) {
    case "card":
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    case "detail":
      return "(max-width: 1024px) 100vw, 50vw";
    case "thumbnail":
      return "(max-width: 768px) 33vw, 11vw";
    case "hero":
      return "100vw";
    default:
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }
}

/**
 * Get priority loading flag based on context
 * Use priority for above-the-fold images
 */
export function shouldPriorityLoad(
  context: "featured" | "first" | "detail" | "other" = "other"
): boolean {
  return context === "featured" || context === "first" || context === "detail";
}
