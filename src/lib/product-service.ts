import { notFound } from "next/navigation";

import type { Artisan, Product as ProductModel, ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  priceCents: number;
  images: string[];
  tags: string[];
  stock: number;
  featured: boolean;
  category: {
    name: string;
    slug: string;
    description?: string;
  };
  artisan: {
    name: string;
    location?: string;
    bio?: string;
    photoUrl?: string;
  };
};

const sampleProducts: SeedProduct[] = [
  {
    name: "Mithila Sunrise Wall Plate",
    slug: "mithila-sunrise-wall-plate",
    sku: "JAC-WD-0001",
    description:
      "Hand-painted terracotta wall plate featuring traditional Madhubani sun motifs in vibrant reds, yellows, and teal accents.",
    priceCents: 3200,
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["terracotta", "sun motif", "wall decor"],
    category: {
      name: "Wall Decor",
      slug: "wall-decor",
      description: "Hand-painted plates and murals that celebrate Janakpur courtyards.",
    },
    artisan: {
      name: "Sita Devi Collective",
      location: "Janakpur, Nepal",
      bio: "Women-led artisan group specializing in ceremonial wall art rooted in Mithila weddings.",
    },
    stock: 24,
    featured: true,
  },
  {
    name: "Janakpur Peacock Canvas",
    slug: "janakpur-peacock-canvas",
    sku: "JAC-PT-0005",
    description:
      "Canvas art piece depicting the iconic Mithila peacock with intricate geometric detailing and natural dye palette.",
    priceCents: 6800,
    images: [
      "https://images.unsplash.com/photo-1577082964587-8335a5f21cfd?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["peacock", "painting", "natural dye"],
    category: {
      name: "Fine Art",
      slug: "fine-art",
      description: "Museum-quality Mithila paintings for collectors and galleries.",
    },
    artisan: {
      name: "Ajit Kumar Sah Atelier",
      location: "Kathmandu & Janakpur",
      bio: "Studio founded by Ajit Kumar Sah carrying forward the legacy of large-format Madhubani canvases.",
    },
    stock: 12,
    featured: true,
  },
  {
    name: "Maithili Story Scroll",
    slug: "maithili-story-scroll",
    sku: "JAC-TX-0012",
    description:
      "Hand-illustrated fabric scroll narrating the Ram-Sita wedding procession, embellished with natural vegetable dyes.",
    priceCents: 9500,
    images: [
      "https://images.unsplash.com/photo-1588850551374-3f5f6c01039d?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["scroll", "ram-sita", "vegetable dye"],
    category: {
      name: "Textile Art",
      slug: "textile-art",
      description: "Fabric-based artworks, scrolls, and tapestries telling Maithili stories.",
    },
    artisan: {
      name: "Janki Storytellers Guild",
      location: "Janakpur, Nepal",
      bio: "Collective of narrative painters who chronicle festivals and folklore on textiles.",
    },
    stock: 8,
    featured: true,
  },
  {
    name: "Lotus Courtyard Cushion Cover",
    slug: "lotus-courtyard-cushion-cover",
    sku: "JAC-HM-0044",
    description:
      "Handwoven cotton cushion cover with lotus motifs and mirror work inspired by Janakpur courtyard murals.",
    priceCents: 2800,
    images: [
      "https://images.unsplash.com/photo-1616628182504-e2d3e4acd475?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["cushion", "lotus", "handwoven"],
    category: {
      name: "Home Textiles",
      slug: "home-textiles",
      description: "Handloom cushions, throws, and runners embellished with Mithila motifs.",
    },
    artisan: {
      name: "Lotus Loom Cooperative",
      location: "Dhanusha District",
      bio: "Handloom cooperative known for blending mirror-work with organic cotton weaving.",
    },
    stock: 40,
    featured: false,
  },
  {
    name: "Festive Maithili Coaster Set",
    slug: "festive-maithili-coaster-set",
    sku: "JAC-HM-0060",
    description:
      "Set of six wooden coasters featuring miniature Madhubani motifs, sealed for everyday use.",
    priceCents: 2100,
    images: [
      "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["coaster", "festival", "gift"],
    category: {
      name: "Home Accents",
      slug: "home-accents",
      description: "Functional decor inspired by Janakpur festivities and symbolism.",
    },
    artisan: {
      name: "Shankhamul Craft Workshop",
      location: "Kathmandu, Nepal",
      bio: "Workshop founded in the 1980s to produce export-ready home accents and souvenirs.",
    },
    stock: 65,
    featured: false,
  },
  {
    name: "Mithila Filigree Earrings",
    slug: "mithila-filigree-earrings",
    sku: "JAC-JW-0101",
    description:
      "Hand-crafted silver earrings inspired by Janakpur bridal jewellery, detailed with lotus and peacock engravings.",
    priceCents: 5400,
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["jewellery", "bridal", "silver"],
    category: {
      name: "Jewellery",
      slug: "jewellery",
      description: "Statement pieces and heirloom jewellery crafted by Mithila metalsmiths.",
    },
    artisan: {
      name: "Janakpur Metals Collective",
      location: "Janakpur, Nepal",
      bio: "Family of jewellers crafting filigree ornaments for ceremonial wear.",
    },
    stock: 30,
    featured: true,
  },
  {
    name: "Sacred Banyan Floor Runner",
    slug: "sacred-banyan-floor-runner",
    sku: "JAC-TX-0020",
    description:
      "Handloom runner dyed with indigo and madder, patterned with sacred banyan leaves and folk border motifs.",
    priceCents: 12400,
    images: [
      "https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["floor runner", "indigo", "madder"],
    category: {
      name: "Home Textiles",
      slug: "home-textiles",
    },
    artisan: {
      name: "Tree of Life Weavers",
      location: "Siraha, Nepal",
      bio: "Weaving collective that preserves natural dye practices inspired by sacred groves.",
    },
    stock: 14,
    featured: true,
  },
];

type LegacyProductDoc = {
  _id: string | { $oid: string };
  name: string;
  slug?: string;
};

let hasSeeded = false;

async function ensureSeedData() {
  if (hasSeeded) {
    return;
  }

  const legacyResult = (await prisma.$runCommandRaw({
    aggregate: "Product",
    pipeline: [
      {
        $match: {
          $or: [{ sku: { $exists: false } }, { sku: null }, { sku: "" }],
        },
      },
      {
        $project: { _id: 1, name: 1, slug: 1 },
      },
    ],
    cursor: { batchSize: 50 },
  })) as { cursor?: { firstBatch?: LegacyProductDoc[] } };

  const legacyProducts = legacyResult.cursor?.firstBatch ?? [];

  if (legacyProducts.length > 0) {
    await Promise.all(
      legacyProducts.map((product) => {
        const id =
          typeof product._id === "string"
            ? product._id
            : product._id && typeof product._id === "object" && "$oid" in product._id
              ? (product._id.$oid as string)
              : null;

        if (!id) {
          return Promise.resolve();
        }

        const base = product.slug?.length ? product.slug : slugify(product.name);
        const sku = `${base}-${id.slice(-6)}`.toUpperCase();

        return prisma.product.update({
          where: { id },
          data: { sku },
        });
      }),
    );
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      const categoryCache = new Map<string, ProductCategory>();
      const artisanCache = new Map<string, Artisan>();

      for (const product of sampleProducts) {
        let category = categoryCache.get(product.category.slug);
        if (!category) {
          category = await tx.productCategory.upsert({
            where: { slug: product.category.slug },
            update: {
              name: product.category.name,
              description: product.category.description,
            },
            create: {
              name: product.category.name,
              slug: product.category.slug,
              description: product.category.description,
            },
          });
          categoryCache.set(product.category.slug, category);
        }

        let artisan = artisanCache.get(product.artisan.name);
        if (!artisan) {
          artisan = await tx.artisan.upsert({
            where: { name: product.artisan.name },
            update: {
              location: product.artisan.location,
              bio: product.artisan.bio,
              photoUrl: product.artisan.photoUrl,
            },
            create: {
              name: product.artisan.name,
              location: product.artisan.location,
              bio: product.artisan.bio,
              photoUrl: product.artisan.photoUrl,
            },
          });
          artisanCache.set(product.artisan.name, artisan);
        }

        await tx.product.upsert({
          where: { slug: product.slug },
          update: {},
          create: {
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description,
            priceCents: product.priceCents,
            images: product.images,
            tags: product.tags,
            stock: product.stock,
            featured: product.featured,
            published: true,
            publishedAt: new Date(),
            categoryId: category.id,
            artisanId: artisan.id,
          },
        });
      }
    });
  }
  hasSeeded = true;
}

export function toProductPayload(
  product: ProductModel & {
    category: ProductCategory | null;
    artisan: Artisan | null;
  },
): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    priceCents: product.priceCents,
    images: product.images ?? [],
    tags: product.tags ?? [],
    details: product.details as Record<string, unknown> | null,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description,
        }
      : null,
    artisan: product.artisan
      ? {
          id: product.artisan.id,
          name: product.artisan.name,
          location: product.artisan.location,
          photoUrl: product.artisan.photoUrl,
        }
      : null,
    stock: product.stock,
    featured: product.featured,
    published: product.published,
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    createdBy: product.createdBy,
    lastUpdatedBy: product.lastUpdatedBy,
  };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await ensureSeedData();
  const products = await prisma.product.findMany({
    where: { featured: true, published: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      category: true,
      artisan: true,
    },
  });
  return products.map(toProductPayload);
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureSeedData();
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      artisan: true,
    },
  });
  return products.map(toProductPayload);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  await ensureSeedData();
  
  if (!slug) {
    notFound();
  }

  // Use findFirst instead of findUnique when filtering by published
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      category: true,
      artisan: true,
    },
  });

  if (!product) {
    notFound();
  }

  return toProductPayload(product);
}

