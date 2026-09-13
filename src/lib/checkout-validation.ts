export class CheckoutError extends Error {}

export function validateCheckout(body: unknown) {
  if (!body || typeof body !== "object") throw new CheckoutError("Invalid checkout request.");
  const value = body as Record<string, unknown>;
  if (!Array.isArray(value.items) || !value.items.length || value.items.length > 100) throw new CheckoutError("Choose between 1 and 100 products.");
  const seen = new Set<string>();
  const items = value.items.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new CheckoutError("Invalid item.");
    const { productId, quantity } = item as Record<string, unknown>;
    if (typeof productId !== "string" || !/^[a-f0-9]{24}$/i.test(productId) || seen.has(productId) || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new CheckoutError("Invalid product or quantity.");
    seen.add(productId);
    return { productId, quantity };
  });
  if (!value.shippingAddress || typeof value.shippingAddress !== "object") throw new CheckoutError("Shipping address is required.");
  const address = value.shippingAddress as Record<string, unknown>;
  const field = (key: string, required = false) => {
    const raw = address[key];
    if (raw != null && typeof raw !== "string") throw new CheckoutError("Invalid shipping details.");
    const text = typeof raw === "string" ? raw.trim() : "";
    if ((required && !text) || text.length > 200) throw new CheckoutError("Please complete the required shipping fields.");
    return text;
  };
  const shippingAddress = { fullName: field("fullName", true), phone: field("phone"), addressLine1: field("addressLine1", true), addressLine2: field("addressLine2"), city: field("city", true), state: field("state"), postalCode: field("postalCode", true), country: field("country", true).toUpperCase() };
  if (!/^[A-Z]{2}$/.test(shippingAddress.country)) throw new CheckoutError("Use a two-letter country code, such as NP.");
  const shippingMethod = shippingAddress.country === "NP" ? "domestic" : "international";
  return { items, shippingAddress, shippingMethod };
}

export function checkoutTotals(subtotalCents: number, shippingMethod: string) {
  const taxCents = Math.round(subtotalCents * 0.08);
  const shippingCents = shippingMethod === "domestic" ? Math.max(800, Math.round(subtotalCents * 0.05)) : Math.max(2500, Math.round(subtotalCents * 0.12));
  const totalCents = subtotalCents + taxCents + shippingCents;
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0 || totalCents > 2147483647) throw new CheckoutError("Order amount exceeds the supported limit.");
  return { subtotalCents, taxCents, shippingCents, totalCents };
}
