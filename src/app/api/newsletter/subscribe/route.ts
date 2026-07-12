import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
});

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, source } = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return NextResponse.json({ message: "Already subscribed." }, { status: 200 });
      }
      // Reactivate if unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          status: "ACTIVE",
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      });
      return NextResponse.json({ message: "Successfully resubscribed!" });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
        source: source || "website",
        status: "ACTIVE",
      },
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: "Welcome to Janakpur Art and Craft Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #F97316;">Welcome to Janakpur Art and Craft!</h1>
          <p>Thank you for subscribing to our newsletter. You'll receive updates about:</p>
          <ul>
            <li>New Mithila art collections</li>
            <li>Exclusive offers and promotions</li>
            <li>Artisan stories and behind-the-scenes content</li>
            <li>Cultural events and exhibitions</li>
          </ul>
          <p>We're excited to share the beauty of Mithila artistry with you!</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Janakpur Art and Craft<br>
            Handcrafted Mithila Artistry Since 1993
          </p>
        </div>
      `,
      text: `Welcome to Janakpur Art and Craft! Thank you for subscribing to our newsletter.`,
    });

    return NextResponse.json({ message: "Successfully subscribed!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    console.error("Failed to subscribe:", error);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }
}


