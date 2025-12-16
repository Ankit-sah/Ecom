import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { authOptions } from "@/lib/auth";
import { getBaseUrl } from "@/lib/structured-data";
import { CartProvider } from "@/providers/cart-provider";
import { AuthProvider } from "@/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Janakpur Art and Craft",
    template: "%s | Janakpur Art and Craft",
  },
  description:
    "Janakpur Art and Craft brings vibrant Mithila artistry online with a curated collection of handmade decor, textiles, and gifts. Handcrafted in Nepal since 1993.",
  keywords: [
    "Mithila art",
    "Madhubani paintings",
    "handcrafted decor",
    "Nepal handicrafts",
    "Janakpur art",
    "traditional textiles",
    "artisan made",
    "fair trade",
  ],
  authors: [{ name: "Janakpur Art and Craft" }],
  creator: "Janakpur Art and Craft",
  publisher: "Janakpur Art and Craft",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Janakpur Art and Craft",
    title: "Janakpur Art and Craft - Handcrafted Mithila Artistry",
    description:
      "Discover vibrant Madhubani paintings, handwoven textiles, and decor inspired by Janakpur's folklore. Each piece celebrates the artisans who bring this heritage to life.",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Janakpur Art and Craft - Handcrafted Mithila Artistry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Janakpur Art and Craft - Handcrafted Mithila Artistry",
    description:
      "Discover vibrant Madhubani paintings, handwoven textiles, and decor inspired by Janakpur's folklore.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-br from-[#fff7ec] via-[#ffe8c5] to-[#ffd1e3] antialiased text-gray-800`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[orange-500] focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-[orange-500] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <AuthProvider session={session}>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main id="main-content" className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
