"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { FormActionResult } from "@/components/action-form";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/server-auth";
import { CheckoutError, validateShippingAddress } from "@/lib/checkout-validation";

class CustomerInputError extends Error {}

async function customer() {
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/auth/sign-in");
  return session.user;
}

function text(data: FormData, key: string, max: number, required = true) {
  const value = data.get(key);
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  ) {
    throw new CustomerInputError(`Invalid ${key}.`);
  }
  return value.trim();
}

function validationResult(error: unknown): FormActionResult {
  if (error instanceof CustomerInputError || error instanceof CheckoutError) {
    return { error: error.message };
  }
  throw error;
}

export async function saveAddress(data: FormData): Promise<FormActionResult> {
  const user = await customer();
  try {
    const fields = Object.fromEntries(
      [
        "fullName",
        "phone",
        "addressLine1",
        "addressLine2",
        "city",
        "state",
        "postalCode",
        "country",
      ].map((key) => [key, data.get(key)]),
    );
    const shippingAddress = validateShippingAddress(fields);
    const id = text(data, "id", 24, false);
    const values = {
      ...shippingAddress,
      label: text(data, "label", 80, false),
      saved: true,
    };

    if (id) {
      if (!/^[a-f0-9]{24}$/i.test(id)) {
        throw new CustomerInputError("Address not found.");
      }
      const result = await prisma.address.updateMany({
        where: { id, userId: user.id, saved: true },
        data: values,
      });
      if (!result.count) throw new CustomerInputError("Address not found.");
    } else {
      const count = await prisma.address.count({
        where: { userId: user.id, saved: true },
      });
      if (count >= 20) {
        throw new CustomerInputError("You can save up to 20 addresses.");
      }
      await prisma.address.create({ data: { ...values, userId: user.id } });
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: "Address saved." };
  } catch (error) {
    return validationResult(error);
  }
}

export async function deleteAddress(id: string): Promise<FormActionResult> {
  const user = await customer();
  if (!/^[a-f0-9]{24}$/i.test(id)) return { error: "Address not found." };

  // Detach from the address book; historical order snapshots are preserved.
  const result = await prisma.address.updateMany({
    where: { id, userId: user.id, saved: true },
    data: { saved: false },
  });
  if (!result.count) return { error: "Address not found." };

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: "Address deleted." };
}

export async function createTicket(data: FormData): Promise<FormActionResult> {
  const user = await customer();
  try {
    const subject = text(data, "subject", 120);
    const message = text(data, "message", 4000);
    const orderId = text(data, "orderId", 24, false);
    const recent = await prisma.supportTicket.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 3_600_000) },
      },
    });
    if (recent >= 10) {
      throw new CustomerInputError(
        "Too many support requests. Please reply to an existing request or try again later.",
      );
    }
    if (
      orderId &&
      (!/^[a-f0-9]{24}$/i.test(orderId) ||
        !(await prisma.order.findFirst({
          where: { id: orderId, userId: user.id },
        })))
    ) {
      throw new CustomerInputError("Order not found.");
    }

    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        orderId: orderId || null,
        subject,
        messages: { create: { body: message, authorId: user.id } },
      },
    });
    revalidatePath("/account/support");
    revalidatePath("/admin/support");
    return { success: "Support request created. You can follow its progress below." };
  } catch (error) {
    return validationResult(error);
  }
}

export async function replyTicket(
  id: string,
  data: FormData,
): Promise<FormActionResult> {
  const user = await customer();
  try {
    const staff = ["ADMIN", "STAFF"].includes(user.role ?? "CUSTOMER");
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      throw new CustomerInputError("Ticket not found.");
    }
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, ...(staff ? {} : { userId: user.id }) },
    });
    if (!ticket) throw new CustomerInputError("Ticket not found.");

    const status = text(data, "status", 20, false);
    if (
      status &&
      (!staff || !["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status))
    ) {
      throw new CustomerInputError("Invalid status.");
    }
    const message = text(data, "message", 4000, false);
    if (!message && !status) throw new CustomerInputError("Enter a message.");

    await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status
          ? { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
          : message && !staff
            ? { status: "OPEN" }
            : {}),
        messages: {
          create: {
            body: [
              message,
              status ? `Status updated to ${status.replaceAll("_", " ")}.` : "",
            ]
              .filter(Boolean)
              .join("\n"),
            authorId: user.id,
            fromStaff: staff,
          },
        },
      },
    });
    revalidatePath("/account/support");
    revalidatePath("/admin/support");
    return { success: staff ? "Ticket updated." : "Reply sent." };
  } catch (error) {
    return validationResult(error);
  }
}
