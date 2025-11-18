import "server-only";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";

// Type for JSON values in Prisma
type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

type ImportProductPayload = {
  name: string;
  sku: string;
  slug?: string;
  description?: string;
  priceCents: number;
  images: string[];
  tags?: string[];
  stock?: number;
  featured?: boolean;
  published?: boolean;
  category?: { name: string; slug?: string };
  artisan?: { name: string; location?: string; bio?: string };
};

async function processImportPayload(payload: ImportProductPayload[], actorEmail?: string | null) {
  const summary = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const product of payload) {
    if (!product.name || !product.sku) {
      summary.errors.push(`Missing name or SKU for product ${JSON.stringify(product)}`);
      continue;
    }

    try {
      let categoryId: string | undefined;
      if (product.category?.name) {
        const slug =
          product.category.slug?.length ? product.category.slug : product.category.name.toLowerCase().replace(/\s+/g, "-");
        const category = await prisma.productCategory.upsert({
          where: { slug },
          update: {
            name: product.category.name,
          },
          create: {
            name: product.category.name,
            slug,
          },
        });
        categoryId = category.id;
      }

      let artisanId: string | undefined;
      if (product.artisan?.name) {
        const artisan = await prisma.artisan.upsert({
          where: { name: product.artisan.name },
          update: {
            location: product.artisan.location,
            bio: product.artisan.bio,
          },
          create: {
            name: product.artisan.name,
            location: product.artisan.location,
            bio: product.artisan.bio,
          },
        });
        artisanId = artisan.id;
      }

      const existing = await prisma.product.findUnique({ where: { sku: product.sku } });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: product.name,
            description: product.description,
            slug: product.slug?.length ? product.slug : existing.slug,
            priceCents: product.priceCents,
            images: product.images,
            tags: product.tags ?? [],
            stock: typeof product.stock === "number" ? product.stock : existing.stock,
            featured: product.featured ?? existing.featured,
            published: product.published ?? existing.published,
            publishedAt:
              product.published ?? existing.published ? existing.publishedAt ?? new Date() : existing.publishedAt ?? null,
            categoryId: categoryId ?? existing.categoryId,
            artisanId: artisanId ?? existing.artisanId,
            lastUpdatedBy: actorEmail ?? null,
            auditLog: {
              create: {
                action: "UPDATED_VIA_IMPORT",
                actorEmail: actorEmail ?? undefined,
                changes: product as JsonValue,
              },
            },
          },
        });
        summary.updated += 1;
      } else {
        await prisma.product.create({
          data: {
            name: product.name,
            slug: product.slug?.length ? product.slug : product.name.toLowerCase().replace(/\s+/g, "-"),
            sku: product.sku,
            description: product.description ?? null,
            priceCents: product.priceCents,
            images: product.images,
            tags: product.tags ?? [],
            stock: product.stock ?? 0,
            featured: product.featured ?? false,
            published: product.published ?? false,
            publishedAt: product.published ? new Date() : null,
            categoryId,
            artisanId,
            createdBy: actorEmail ?? null,
            lastUpdatedBy: actorEmail ?? null,
            auditLog: {
              create: {
                action: "CREATED_VIA_IMPORT",
                actorEmail: actorEmail ?? undefined,
                changes: product as JsonValue,
              },
            },
          },
        });
        summary.created += 1;
      }
    } catch (error) {
      summary.errors.push(`Failed to import ${product.sku}: ${(error as Error).message}`);
    }
  }

  return summary;
}

async function submitImport(formData: FormData) {
  "use server";
  const session = await requireRole(["ADMIN", "STAFF"]);

  const rawPayload = formData.get("payload")?.toString();
  const filename = formData.get("filename")?.toString() ?? "manual-upload.json";

  if (!rawPayload) {
    throw new Error("No payload provided.");
  }

  const job = await prisma.catalogImportJob.create({
    data: {
      filename,
      status: "PROCESSING",
      createdBy: session.user?.email ?? null,
    },
  });

  try {
    const parsed = JSON.parse(rawPayload) as ImportProductPayload[];
    const summary = await processImportPayload(parsed, session.user?.email ?? null);

    await prisma.catalogImportJob.update({
      where: { id: job.id },
      data: {
        status: summary.errors.length > 0 ? "FAILED" : "COMPLETED",
        summary,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.catalogImportJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        summary: {
          error: (error as Error).message,
        },
        completedAt: new Date(),
      },
    });
    throw error;
  }

  revalidatePath("/admin/imports");
}

async function fetchImportHistory() {
  return prisma.catalogImportJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

type ImportJob = Awaited<ReturnType<typeof fetchImportHistory>>[number];

export default async function AdminImportsPage() {
  const history = await fetchImportHistory();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/90 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Bulk import catalogue</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Paste JSON payloads exported from the warehouse system to sync products at scale. The importer will upsert
          categories and artisan profiles automatically.
        </p>
        <form action={submitImport} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="filename">
              Reference name
            </label>
            <input
              id="filename"
              name="filename"
              placeholder="janakpur-warehouse-2025-01.json"
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="payload">
              JSON payload*
            </label>
            <textarea
              id="payload"
              name="payload"
              required
              rows={12}
              placeholder='[{"name":"Mithila Sunrise Plate","sku":"JAC-NEW-001","priceCents":3200,"images":["https://..."],"tags":["terracotta"],"stock":20,"featured":true,"published":true,"category":{"name":"Wall Decor"},"artisan":{"name":"Sita Devi Collective","location":"Janakpur"}}]'
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
          >
            Process import
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/90 p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-[#40111f]">Recent import history</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#f6b2c5]/60">
          <table className="min-w-full divide-y divide-[#f6b2c5]/60 text-left text-sm">
            <thead className="bg-[#ffe1ef]/60 text-xs uppercase tracking-[0.35em] text-[#b03d5e]">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6b2c5]/40 bg-white/70">
              {history.map((job: ImportJob) => (
                <tr key={job.id}>
                  <td className="px-4 py-3 text-sm text-[#40111f]">{job.filename ?? "Manual import"}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        job.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : job.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {job.summary
                      ? JSON.stringify(job.summary)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(job.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

