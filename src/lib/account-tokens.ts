import { createHash, randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

type AccountTokenType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAccountToken(userId: string, type: AccountTokenType) {
  const token = randomBytes(32).toString("hex");
  await prisma.accountToken.deleteMany({ where: { userId, type } });
  await prisma.accountToken.create({
    data: { userId, type, tokenHash: hashToken(token), expires: new Date(Date.now() + 60 * 60 * 1000) },
  });
  return token;
}

export async function consumeAccountToken(token: string, type: AccountTokenType) {
  const accountToken = await prisma.accountToken.findFirst({ where: { tokenHash: hashToken(token), type } });
  if (!accountToken || accountToken.expires <= new Date()) {
    if (accountToken) await prisma.accountToken.delete({ where: { id: accountToken.id } });
    return null;
  }
  await prisma.accountToken.delete({ where: { id: accountToken.id } });
  return accountToken.userId;
}
