import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Janakpur Art and Craft. Learn how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy | Janakpur Art and Craft",
    description: "Our commitment to protecting your privacy and personal information.",
    url: getCanonicalUrl("/privacy"),
  },
  alternates: {
    canonical: getCanonicalUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Privacy & Security</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Privacy Policy</h1>
          <p className="text-sm text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <section className="prose prose-sm max-w-none space-y-6 text-neutral-700">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Introduction</h2>
          <p>
            Janakpur Art and Craft (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our website and make
            purchases.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Information We Collect</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-[#8a2040]">Personal Information</h3>
              <p>
                We collect information that you provide directly to us, including name, email address, phone number,
                shipping and billing addresses, and payment information when you make a purchase or create an account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#8a2040]">Automatically Collected Information</h3>
              <p>
                We automatically collect certain information about your device and how you interact with our website,
                including IP address, browser type, pages viewed, and time spent on pages.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and our products</li>
            <li>Send you marketing communications (with your consent)</li>
            <li>Improve our website and customer experience</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with service providers who assist us
            in operating our website, processing payments, and fulfilling orders. These service providers are contractually
            obligated to protect your information.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the
            internet is 100% secure.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and
            personalize content. You can control cookies through your browser settings.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at{" "}
            <a href="mailto:privacy@janakpurartandcraft.com" className="font-semibold text-[#8a2040] hover:underline">
              privacy@janakpurartandcraft.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

