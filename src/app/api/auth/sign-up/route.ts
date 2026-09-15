import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";
import { createAccountToken } from "@/lib/account-tokens";
import { sendEmailVerificationEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
    };

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
    }

    try {
      const rateLimit = await isRateLimited(request, "sign-up", { limit: 5, windowMs: 60 * 60 * 1000 });
      if (rateLimit.limited) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    } catch (error) {
      // Do not make account creation unavailable because a defensive control is unavailable.
      console.error("Sign-up rate limit unavailable", error);
    }

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: await hashPassword(password),
        role: "CUSTOMER",
      },
    });
    let verificationEmailSent = false;
    try {
      const verificationToken = await createAccountToken(user.id, "EMAIL_VERIFICATION");
      verificationEmailSent = await sendEmailVerificationEmail(email, verificationToken);
    } catch (error) {
      // The customer account is valid even when optional email delivery is misconfigured or unavailable.
      console.error("Verification email setup failed for newly created user", error);
    }
    return NextResponse.json({ success: true, verificationEmailSent }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }
    console.error("Failed to create local user", error);
    return NextResponse.json({ error: "We could not create your account right now. Please try again shortly." }, { status: 500 });
  }
}
