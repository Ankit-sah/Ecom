import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";

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

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: await hashPassword(password),
        role: "CUSTOMER",
      },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }
    console.error("Failed to create local user", error);
    return NextResponse.json({ error: "Unexpected error while creating user." }, { status: 500 });
  }
}
