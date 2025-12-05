import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy endpoint that:
 * - Validates image URLs (only allows Vercel Blob URLs)
 * - Adds proper caching headers
 * - Can be extended with security checks
 * - Supports query parameters for optimization
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  // Validate that the URL is from Vercel Blob (security check)
  const allowedDomains = [
    "public.blob.vercel-storage.com",
    "*.public.blob.vercel-storage.com",
  ];

  try {
    const url = new URL(imageUrl);
    const isAllowed = allowedDomains.some((domain) => {
      if (domain.startsWith("*.")) {
        const baseDomain = domain.slice(2);
        return url.hostname.endsWith(baseDomain);
      }
      return url.hostname === domain;
    });

    if (!isAllowed) {
      return NextResponse.json({ error: "Invalid image source" }, { status: 403 });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: imageResponse.status }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Return image with optimized caching headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
