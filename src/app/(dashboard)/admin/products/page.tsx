import "server-only";

import { revalidatePath } from "next/cache";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import type { Product } from "@/types/product";
import { formatCurrencyFromCents } from "@/utils/format";
import { ProductImagesField } from "@/components/admin/product-images-field";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchAdminCatalogue() {
  const [products, categories, artisans] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        artisan: true,
      },
    }),
    prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.artisan.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  type ProductWithRelations = (typeof products)[number];
  type Category = (typeof categories)[number];
  type Artisan = (typeof artisans)[number];

  return {
    products: products.map((product: ProductWithRelations) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      priceCents: product.priceCents,
      images: product.images,
      tags: product.tags,
      details: product.details as Record<string, unknown> | null,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            description: product.category.description ?? undefined,
          }
        : null,
      artisan: product.artisan
        ? {
            id: product.artisan.id,
            name: product.artisan.name,
            location: product.artisan.location ?? undefined,
            photoUrl: product.artisan.photoUrl ?? undefined,
          }
        : null,
      stock: product.stock,
      featured: product.featured,
      published: product.published,
      publishedAt: product.publishedAt?.toISOString() ?? null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      createdBy: product.createdBy ?? undefined,
      lastUpdatedBy: product.lastUpdatedBy ?? undefined,
    })) satisfies Product[],
    categories,
    artisans,
  };
}

type CatalogueData = Awaited<ReturnType<typeof fetchAdminCatalogue>>;

async function createProduct(formData: FormData) {
  "use server";

  const session = await requireRole(["ADMIN", "STAFF"]);

  const name = formData.get("name")?.toString().trim();
  const sku = formData.get("sku")?.toString().trim();
  const slugInput = formData.get("slug")?.toString().trim();
  const priceCents = Number(formData.get("priceCents"));
  const stock = Number(formData.get("stock"));
  const description = formData.get("description")?.toString().trim() ?? null;
  const imagesInput = formData.get("images")?.toString() ?? "";
  const tagsInput = formData.get("tags")?.toString() ?? "";
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  const categoryId = formData.get("categoryId")?.toString() || null;
  const categoryName = formData.get("categoryName")?.toString().trim();
  const categorySlug = formData.get("categorySlug")?.toString().trim();
  const artisanId = formData.get("artisanId")?.toString() || null;
  const artisanName = formData.get("artisanName")?.toString().trim();
  const artisanLocation = formData.get("artisanLocation")?.toString().trim();
  const artisanBio = formData.get("artisanBio")?.toString().trim();

  if (!name || !sku || Number.isNaN(priceCents) || Number.isNaN(stock)) {
    throw new Error("Missing required fields.");
  }

  const slug = slugInput?.length ? slugify(slugInput) : slugify(name);
  const images = imagesInput
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);
  if (images.length === 0) {
    throw new Error("Please upload at least one product image.");
  }
  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  let finalCategoryId: string | undefined;
  if (categoryId) {
    finalCategoryId = categoryId;
  } else if (categoryName) {
    const resolvedSlug = categorySlug?.length ? slugify(categorySlug) : slugify(categoryName);
    const category = await prisma.productCategory.upsert({
      where: { slug: resolvedSlug },
      update: {
        name: categoryName,
        description,
      },
      create: {
        name: categoryName,
        slug: resolvedSlug,
        description,
      },
    });
    finalCategoryId = category.id;
  }

  let finalArtisanId: string | undefined;
  if (artisanId) {
    finalArtisanId = artisanId;
  } else if (artisanName) {
    const artisan = await prisma.artisan.upsert({
      where: { name: artisanName },
      update: {
        location: artisanLocation,
        bio: artisanBio,
      },
      create: {
        name: artisanName,
        location: artisanLocation,
        bio: artisanBio,
      },
    });
    finalArtisanId = artisan.id;
  }

  await prisma.product.create({
    data: {
      name,
      slug,
      sku,
      description,
      priceCents,
      stock,
      images,
      tags,
      featured,
      published,
      publishedAt: published ? new Date() : null,
      categoryId: finalCategoryId,
      artisanId: finalArtisanId,
      createdBy: session.user?.email ?? null,
      lastUpdatedBy: session.user?.email ?? null,
    },
  });

  revalidatePath("/admin/products");
}

async function updateProductPublishStatus(productId: string, nextState: { published?: boolean; featured?: boolean }) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  await prisma.product.update({
    where: { id: productId },
    data: {
      ...("published" in nextState
        ? {
            published: nextState.published,
            publishedAt: nextState.published ? new Date() : null,
          }
        : {}),
      ...("featured" in nextState ? { featured: nextState.featured } : {}),
      lastUpdatedBy: session.user?.email ?? null,
    },
  });
  revalidatePath("/admin/products");
}

async function deleteProduct(productId: string) {
  await requireRole(["ADMIN"]);
  await prisma.product.delete({
    where: { id: productId },
  });
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
  const { products, categories, artisans } = await fetchAdminCatalogue();

  type Product = CatalogueData["products"][number];
  type Category = CatalogueData["categories"][number];
  type Artisan = CatalogueData["artisans"][number];

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/90 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#40111f]">Add a new catalogue item</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Use this form to create new Mithila products. Provide high-quality image URLs and tags to help with search.
        </p>
        <form action={createProduct} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="name">
              Name*
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="sku">
              SKU*
            </label>
            <input
              id="sku"
              name="sku"
              required
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm uppercase tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              placeholder="auto-generated if left blank"
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="priceCents">
              Price (in cents)*
            </label>
            <input
              id="priceCents"
              name="priceCents"
              type="number"
              required
              min="0"
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="stock">
              Stock quantity*
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              required
              min="0"
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              placeholder="terracotta, wall decor, ceremonial"
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-[#40111f]" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <ProductImagesField />
          </div>
          <fieldset className="space-y-2 rounded-2xl border border-[#f6b2c5]/70 bg-white/60 p-4">
            <legend className="px-2 text-sm font-semibold text-[#40111f]">Category</legend>
            <label className="block text-xs font-semibold text-[#8a2040]" htmlFor="categoryId">
              Select existing category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            >
              <option value="">-- No category --</option>
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              Or create a new category below. Leave blank if you selected an existing one.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                name="categoryName"
                placeholder="New category name"
                className="rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
              />
              <input
                name="categorySlug"
                placeholder="custom-slug (optional)"
                className="rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
              />
            </div>
          </fieldset>
          <fieldset className="space-y-2 rounded-2xl border border-[#f6b2c5]/70 bg-white/60 p-4">
            <legend className="px-2 text-sm font-semibold text-[#40111f]">Artisan</legend>
            <label className="block text-xs font-semibold text-[#8a2040]" htmlFor="artisanId">
              Select existing artisan
            </label>
            <select
              id="artisanId"
              name="artisanId"
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
            >
              <option value="">-- No artisan --</option>
              {artisans.map((artisan: Artisan) => (
                <option key={artisan.id} value={artisan.id}>
                  {artisan.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              Or create a new artisan profile by providing the details below.
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                name="artisanName"
                placeholder="Artisan or collective name"
                className="rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm md:col-span-2"
              />
              <input
                name="artisanLocation"
                placeholder="Location"
                className="rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
              />
              <textarea
                name="artisanBio"
                rows={2}
                placeholder="Short bio"
                className="md:col-span-3 rounded-xl border border-[#f6b2c5]/70 bg-white px-3 py-2 text-sm"
              />
            </div>
          </fieldset>
          <div className="flex items-center gap-4 md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#40111f]">
              <input type="checkbox" name="featured" className="h-4 w-4 rounded border-[#f6b2c5]/70 text-[#8a2040]" />{" "}
              Featured
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#40111f]">
              <input type="checkbox" name="published" className="h-4 w-4 rounded border-[#f6b2c5]/70 text-[#8a2040]" />{" "}
              Published
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-[#8a2040] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
            >
              Create product
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-[#f6b2c5]/70 bg-white/90 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#40111f]">Catalogue overview</h2>
            <p className="text-sm text-neutral-600">
              Manage visibility, feature placement, and stock for each artisan-made item.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-[#f6b2c5]/70 px-4 py-2 text-sm font-semibold text-[#8a2040] hover:border-[#8a2040]"
          >
            View live catalogue
          </Link>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#f6b2c5]/60">
          <table className="min-w-full divide-y divide-[#f6b2c5]/60 text-left text-sm">
            <thead className="bg-[#ffe1ef]/60 text-xs uppercase tracking-[0.35em] text-[#b03d5e]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Artisan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6b2c5]/40 bg-white/70">
              {products.map((product: Product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-[#40111f]">{product.name}</p>
                      <p className="text-xs text-neutral-500">
                        SKU {product.sku} • Updated{" "}
                        {new Date(product.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600">
                    {product.category?.name ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600">
                    {product.artisan?.name ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await updateProductPublishStatus(product.id, { published: !product.published });
                        }}
                      >
                        <button
                          type="submit"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.published
                              ? "bg-green-100 text-green-700"
                              : "border border-neutral-300 text-neutral-600"
                          }`}
                        >
                          {product.published ? "Published" : "Draft"}
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await updateProductPublishStatus(product.id, { featured: !product.featured });
                        }}
                      >
                        <button
                          type="submit"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.featured
                              ? "bg-[#ffe1ef] text-[#8a2040]"
                              : "border border-[#f6b2c5]/60 text-neutral-600"
                          }`}
                        >
                          {product.featured ? "Featured" : "Standard"}
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600">{product.stock}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#8a2040]">
                    {formatCurrencyFromCents(product.priceCents)}
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-neutral-500">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="rounded-full border border-[#f6b2c5]/70 px-3 py-1 font-semibold text-[#8a2040] hover:border-[#8a2040]"
                      >
                        View
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(product.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-3 py-1 font-semibold text-red-600 hover:border-red-400"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
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

