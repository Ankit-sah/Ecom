import type { Product } from "@/types/product";

export type ProductDetails = {
  materials: string;
  dimensions: string;
  care: string;
  origin: string;
  dispatch: string;
  delivery: string;
};

const defaults = {
  materials: "Hand-selected local materials and traditional Mithila pigments.",
  dimensions: "Because each piece is handmade, minor variations are part of its character.",
  care: "Keep away from prolonged direct sunlight and moisture. Dust gently with a soft, dry cloth.",
};

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getProductDetails(product: Pick<Product, "details" | "tags" | "category" | "artisan">): ProductDetails {
  const data = product.details ?? {};
  const category = product.category?.name?.toLowerCase() ?? "";
  const tags = product.tags.join(" ").toLowerCase();
  const textile = /textile|fabric|scarf|stole|cotton/.test(`${category} ${tags}`);
  const vessel = /ceramic|terracotta|plate|vessel|pottery/.test(`${category} ${tags}`);

  return {
    materials: stringValue(data.materials) ?? (textile ? "Handwoven textile with hand-painted natural pigments." : vessel ? "Hand-formed terracotta with hand-painted natural pigments." : defaults.materials),
    dimensions: stringValue(data.dimensions) ?? defaults.dimensions,
    care: stringValue(data.care) ?? (textile ? "Spot clean gently or dry clean. Store folded away from direct sunlight and moisture." : vessel ? "Handle with care. Wipe with a soft, dry cloth; do not soak or place in a dishwasher." : defaults.care),
    origin: stringValue(data.origin) ?? product.artisan?.location ?? "Janakpur, Nepal",
    dispatch: stringValue(data.dispatch) ?? "Usually dispatched within 2–3 business days.",
    delivery: stringValue(data.delivery) ?? "Nepal: 3–5 business days after dispatch · International: 5–10 business days after dispatch.",
  };
}
