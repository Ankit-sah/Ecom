import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

import { requireRole } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireRole(["ADMIN", "STAFF", "ARTISAN_MANAGER"]);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File field is missing." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const blob = await put(`products/${filename}`, buffer, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}

