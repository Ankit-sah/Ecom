"use client";

import Image from "next/image";
import { getImageSizes, shouldPriorityLoad } from "@/lib/image-utils";

type OptimizedImageProps = {
  src: string;
  alt: string;
  context?: "card" | "detail" | "thumbnail" | "hero";
  priority?: boolean;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

/**
 * Optimized Image component that wraps Next.js Image
 * with automatic optimization settings based on context
 */
export function OptimizedImage({
  src,
  alt,
  context = "card",
  priority,
  className,
  fill,
  width,
  height,
  sizes,
  ...props
}: OptimizedImageProps) {
  // Determine priority based on context if not explicitly set
  const shouldPriority = priority ?? shouldPriorityLoad(
    context === "detail" ? "detail" : context === "hero" ? "featured" : "other"
  );

  // Get optimized sizes if not provided
  const imageSizes = sizes ?? getImageSizes(context);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={imageSizes}
        className={className}
        priority={shouldPriority}
        loading={shouldPriority ? undefined : "lazy"}
        quality={85}
        {...props}
      />
    );
  }

  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={imageSizes}
        className={className}
        priority={shouldPriority}
        loading={shouldPriority ? undefined : "lazy"}
        quality={85}
        {...props}
      />
    );
  }

  // Fallback if neither fill nor dimensions provided
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={imageSizes}
      className={className}
      priority={shouldPriority}
      loading={shouldPriority ? undefined : "lazy"}
      quality={85}
      {...props}
    />
  );
}
