import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getCanonicalUrl } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Janakpur Art and Craft. Read our terms and conditions for using our website and services.",
  openGraph: {
    title: "Terms of Service | Janakpur Art and Craft",
    description: "Terms and conditions for using our website and services.",
    url: getCanonicalUrl("/terms"),
  },
  alternates: {
    canonical: getCanonicalUrl("/terms"),
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms of Service", href: "/terms" },
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b03d5e]">Legal Information</p>
          <h1 className="text-4xl font-semibold text-[#40111f]">Terms of Service</h1>
          <p className="text-sm text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <section className="prose prose-sm max-w-none space-y-6 text-neutral-700">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Agreement to Terms</h2>
          <p>
            By accessing and using the Janakpur Art and Craft website, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
            using this site.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Use License</h2>
          <p>
            Permission is granted to temporarily access and use the materials on Janakpur Art and Craft's website for
            personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title,
            and under this license you may not:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Product Information</h2>
          <p>
            We strive to provide accurate product descriptions and images. However, we do not warrant that product
            descriptions, images, or other content on this site is accurate, complete, reliable, current, or error-free.
            Colors and textures may vary slightly from what appears on your screen.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Pricing and Payment</h2>
          <p>
            All prices are listed in USD unless otherwise stated. We reserve the right to change prices at any time. You
            agree to provide current, complete, and accurate purchase and account information for all purchases made on
            our website.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Orders and Acceptance</h2>
          <p>
            Your order is an offer to purchase products from us. We reserve the right to accept or reject your order for
            any reason, including product availability, errors in pricing or product information, or fraud prevention.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Limitation of Liability</h2>
          <p>
            In no event shall Janakpur Art and Craft or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
            inability to use the materials on our website.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Revisions and Errata</h2>
          <p>
            The materials appearing on our website could include technical, typographical, or photographic errors. We do
            not warrant that any of the materials on its website are accurate, complete, or current. We may make
            changes to the materials at any time without notice.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Nepal, and you
            irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#40111f]">Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:legal@janakpurartandcraft.com" className="font-semibold text-[#8a2040] hover:underline">
              legal@janakpurartandcraft.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

