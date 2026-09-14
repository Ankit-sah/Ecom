const { loadEnvConfig } = require("@next/env");
const { PrismaClient } = require("@prisma/client");

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const exchangeRate = Number(process.env.PAYMENT_USD_TO_NPR_RATE || 135);

if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
  throw new Error("PAYMENT_USD_TO_NPR_RATE must be a positive number.");
}

const usdCentsFromNpr = (npr) => Math.round((npr / exchangeRate) * 100);

const categories = [
  ["Home Decor", "home-decor", "Handcrafted pieces that bring Mithila art into everyday spaces."],
  ["Serveware", "serveware", "Functional, artful pieces for sharing food and tea."],
  ["Wall Art", "wall-art", "Mithila artworks made to bring story and colour to your walls."],
  ["Storage & Keepsakes", "storage-keepsakes", "Handcrafted boxes and objects for treasured small things."],
];

const products = [
  {
    name: "Hand-Painted Mithila Terracotta Vase",
    slug: "mithila-terracotta-vase",
    sku: "MTH-VASE-001",
    categorySlug: "home-decor",
    npr: 2499,
    stock: 10,
    featured: true,
    image: "/products/mithila-terracotta-vase.png",
    tags: ["mithila art", "terracotta", "vase", "home decor", "janakpur"],
    description: "A handcrafted terracotta vase decorated with traditional Mithila motifs including peacocks, fish, lotus flowers, vines, and intricate geometric borders. Each piece celebrates the vibrant folk-art heritage of Janakpur and makes a distinctive addition to living rooms, entryways, shelves, and cultural interiors.",
    details: { materials: "Terracotta with hand-painted Mithila pigments.", dimensions: "Hand-formed; dimensions vary slightly from piece to piece.", care: "For decorative use. Wipe gently with a dry cloth; do not soak or place in a dishwasher.", origin: "Janakpur, Nepal", dispatch: "Usually dispatched within 2–3 business days.", delivery: "Nepal: 3–5 business days after dispatch · International: 5–10 business days after dispatch." },
  },
  {
    name: "Mithila Art Wooden Serving Tray",
    slug: "mithila-wooden-serving-tray",
    sku: "MTH-TRAY-001",
    categorySlug: "serveware",
    npr: 2299,
    stock: 12,
    featured: true,
    image: "/products/mithila-wooden-serving-tray.png",
    tags: ["mithila art", "wood", "serving tray", "serveware", "janakpur"],
    description: "A beautifully handcrafted wooden serving tray featuring detailed Mithila artwork with traditional fish, birds, lotus flowers, and floral patterns. Functional yet decorative, this artisan tray brings the colors and storytelling traditions of Mithila art into everyday living.",
    details: { materials: "Wood with hand-painted Mithila pigments.", dimensions: "Handcrafted; dimensions vary slightly from piece to piece.", care: "Wipe clean with a soft, lightly damp cloth and dry immediately. Do not soak or place in a dishwasher.", origin: "Janakpur, Nepal", dispatch: "Usually dispatched within 2–3 business days.", delivery: "Nepal: 3–5 business days after dispatch · International: 5–10 business days after dispatch." },
  },
  {
    name: "Traditional Mithila Wall Hanging",
    slug: "traditional-mithila-wall-hanging",
    sku: "MTH-WALL-001",
    categorySlug: "wall-art",
    npr: 3499,
    stock: 8,
    featured: true,
    image: "/products/traditional-mithila-wall-hanging.png",
    tags: ["mithila art", "wall hanging", "textile", "wall art", "janakpur"],
    description: "A decorative Mithila wall hanging featuring traditional folk imagery inspired by nature, village life, peacocks, fish, lotus flowers, and symbolic patterns. Designed as a statement piece for your home, it reflects the rich artistic tradition practiced by Mithila artisans in Nepal.",
    details: { materials: "Painted textile or canvas with natural wood hanging rails.", dimensions: "Handcrafted; dimensions vary slightly from piece to piece.", care: "Dust gently with a soft, dry cloth. Keep away from prolonged direct sunlight and moisture.", origin: "Janakpur, Nepal", dispatch: "Usually dispatched within 2–3 business days.", delivery: "Nepal: 3–5 business days after dispatch · International: 5–10 business days after dispatch." },
  },
  {
    name: "Hand-Painted Mithila Jewelry Box",
    slug: "mithila-hand-painted-jewelry-box",
    sku: "MTH-BOX-001",
    categorySlug: "storage-keepsakes",
    npr: 1899,
    stock: 15,
    featured: false,
    image: "/products/mithila-hand-painted-jewelry-box.png",
    tags: ["mithila art", "wood", "jewelry box", "storage", "keepsake", "janakpur"],
    description: "A handcrafted wooden jewelry and keepsake box decorated with intricate Mithila paintings of peacocks, fish, flowers, and traditional geometric patterns. Ideal for storing jewelry, small accessories, or treasured keepsakes while adding a colorful handcrafted accent to your space.",
    details: { materials: "Wood with hand-painted Mithila pigments.", dimensions: "Handcrafted; dimensions vary slightly from piece to piece.", care: "Wipe gently with a soft, dry cloth. Keep away from standing water and prolonged direct sunlight.", origin: "Janakpur, Nepal", dispatch: "Usually dispatched within 2–3 business days.", delivery: "Nepal: 3–5 business days after dispatch · International: 5–10 business days after dispatch." },
  },
];

async function main() {
  const categoryBySlug = new Map();
  for (const [name, slug, description] of categories) {
    const category = await prisma.productCategory.upsert({ where: { slug }, update: { name, description }, create: { name, slug, description } });
    categoryBySlug.set(slug, category);
  }

  const artisan = await prisma.artisan.upsert({
    where: { name: "Janakpur Art & Craft Collective" },
    update: { location: "Janakpur, Nepal", bio: "A collective preserving and sharing Mithila art traditions through handmade work." },
    create: { name: "Janakpur Art & Craft Collective", location: "Janakpur, Nepal", bio: "A collective preserving and sharing Mithila art traditions through handmade work.", stories: [] },
  });

  for (const product of products) {
    const data = {
      name: product.name,
      sku: product.sku,
      description: product.description,
      priceCents: usdCentsFromNpr(product.npr),
      images: [product.image],
      tags: product.tags,
      details: product.details,
      stock: product.stock,
      featured: product.featured,
      published: true,
      categoryId: categoryBySlug.get(product.categorySlug).id,
      artisanId: artisan.id,
    };
    await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: { slug: product.slug, ...data } });
  }

  console.log(`Upserted ${products.length} Mithila products using NPR-to-USD rate ${exchangeRate}.`);
}

main().finally(() => prisma.$disconnect());
