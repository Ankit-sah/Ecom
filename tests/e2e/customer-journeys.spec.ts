import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();
const suffix = randomBytes(5).toString("hex");
const email = `customer-${suffix}@example.test`;
const staffEmail = `staff-${suffix}@example.test`;
const outsiderEmail = `outsider-${suffix}@example.test`;
const password = "BrowserJourney123!";
let productId: string, slug: string, customerId: string, orderId: string;
let initialCheckoutEvents = 0, initialPaymentEvents = 0;
test.describe.configure({ mode: "serial" });
test.use({ extraHTTPHeaders: { "x-forwarded-for": `e2e-${suffix}` } });
function hash() { const salt = randomBytes(16).toString("hex"); return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
async function login(page: Page, address: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address", { exact: true }).fill(address);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
}

test.beforeAll(async () => {
  initialCheckoutEvents = await prisma.analyticsEvent.count({ where: { event: "checkout_started" } });
  initialPaymentEvents = await prisma.analyticsEvent.count({ where: { event: "payment_started" } });
  const product = await prisma.product.create({ data: { name: `Browser piece ${suffix}`, slug: `browser-piece-${suffix}`, sku: `E2E-${suffix}`, priceCents: 2500, stock: 5, images: [], tags: [] } });
  productId = product.id; slug = product.slug;
  for (const [address, role] of [[staffEmail, "STAFF"], [outsiderEmail, "CUSTOMER"]] as const) {
    await prisma.user.create({ data: { email: address, name: "Browser tester", passwordHash: hash(), role } });
  }
});
test.afterAll(async () => {
  // Clean only records created by this run, never reset the database.
  const users = await prisma.user.findMany({ where: { email: { in: [email, staffEmail, outsiderEmail] } }, select: { id: true } });
  const ids = users.map(u => u.id);
  const tickets = await prisma.supportTicket.findMany({ where: { userId: { in: ids } }, select: { id: true } });
  await prisma.supportMessage.deleteMany({ where: { ticketId: { in: tickets.map(t => t.id) } } });
  await prisma.supportTicket.deleteMany({ where: { userId: { in: ids } } });
  if (productId) await prisma.productReview.deleteMany({ where: { productId } });
  await prisma.wishlistItem.deleteMany({ where: { userId: { in: ids } } });
  const orders = await prisma.order.findMany({ where: { userId: { in: ids } }, select: { id: true } });
  const orderIds = orders.map(o => o.id);
  await prisma.orderShipment.deleteMany({ where: { orderId: { in: orderIds } } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
  await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  await prisma.address.deleteMany({ where: { userId: { in: ids } } });
  await prisma.accountToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  if (productId) {
    await prisma.product.delete({ where: { id: productId } });
    await prisma.analyticsEvent.deleteMany({ where: { OR: [{ productId }, { path: `/products/${slug}` }] } });
  }
  await prisma.rateLimitEntry.deleteMany({ where: { OR: [`e2e-${suffix}`, `staff-${suffix}`, `outsider-${suffix}`].map(ip => ({ key: { endsWith: createHash("sha256").update(ip).digest("hex") } })) } });
  await prisma.$disconnect();
});

test("signup, address prefill, wishlist, cart, sandbox checkout and tracking", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await page.getByLabel("First name*").fill("Browser");
  await page.getByLabel("Last name*").fill("Customer");
  await page.getByLabel("Email address*").fill(email);
  await page.getByLabel("Password*", { exact: true }).fill(password);
  await page.getByLabel("Confirm password*").fill(password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  customerId = (await prisma.user.findUniqueOrThrow({ where: { email } })).id;
  await page.goto("/account/addresses");
  await page.getByLabel("Label", { exact: true }).fill("Home");
  for (const [label, value] of [["Full name", "Browser Customer"], ["Phone", "+9779800000000"], ["Street address", "Janakpur Road"], ["City", "Janakpur"], ["Postal code", "45600"]]) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("textbox", { name: "Full name", exact: true }).fill("   ");
  await page.getByRole("button", { name: "Save address", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "required shipping fields" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Street address", exact: true })).toHaveValue("Janakpur Road");
  await page.getByRole("textbox", { name: "Full name", exact: true }).fill("Browser Customer");
  await page.getByRole("button", { name: "Save address", exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete address" })).toBeVisible();
  await page.goto(`/products/${slug}`);
  await page.getByRole("button", { name: "Save to wishlist", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove from wishlist" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await expect.poll(() => prisma.analyticsEvent.count({ where: { event: "add_to_cart", productId } })).toBe(1);
  await page.goto("/account/wishlist");
  await expect(page.getByText(`Browser piece ${suffix}`, { exact: true })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByText(`Browser piece ${suffix}`, { exact: true })).toBeVisible();
  await page.goto("/checkout");
  await expect(page.locator('input[name="addressLine1"]')).toHaveValue("Janakpur Road");
  // Validate the real sandbox initiation response; do not submit to an external payment gateway.
  let payment: { action: string; fields: { signature: string } } | undefined;
  await page.route("**/api/payments/checkout", async route => {
    const response = await route.fetch();
    payment = await response.json();
    await route.fulfill({ response });
  });
  const responsePromise = page.waitForResponse(r => r.url().endsWith("/api/payments/checkout") && r.request().method() === "POST");
  await page.route("https://rc-epay.esewa.com.np/**", route => route.fulfill({ body: "Sandbox handoff captured" }));
  await page.getByRole("button", { name: /Pay/ }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  expect(payment?.action).toContain("rc-epay.esewa.com.np");
  expect(payment?.fields.signature).toBeTruthy();
  await expect.poll(() => prisma.analyticsEvent.count({ where: { event: "checkout_started" } })).toBeGreaterThan(initialCheckoutEvents);
  await expect.poll(() => prisma.analyticsEvent.count({ where: { event: "payment_started" } })).toBeGreaterThan(initialPaymentEvents);
  const order = await prisma.order.findFirstOrThrow({ where: { userId: customerId }, orderBy: { createdAt: "desc" } });
  orderId = order.id;
  expect(order.status).toBe("PENDING");
  // Seed a completed fulfillment outcome; gateway callback security is covered by payment tests.
  await prisma.order.update({ where: { id: orderId }, data: { status: "PAID", fulfillmentStage: "DISPATCHED", trackingNumber: "E2E-TRACK" } });
  await page.goto("/account/orders");
  await expect(page.getByText("E2E-TRACK", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Need help with this order?" }).click();
  await expect(page.locator('select[name="orderId"]')).toHaveValue(orderId);
  await page.getByLabel("Subject", { exact: true }).fill(`Delivery question ${suffix}`);
  await page.getByLabel("Message", { exact: true }).fill("Please confirm delivery timing.");
  await page.getByRole("button", { name: "Create support request" }).click();
  await expect(page.getByText("Please confirm delivery timing.", { exact: true })).toBeVisible();
});

test("verified review moderation, support updates, analytics and customer isolation", async ({ page, browser }) => {
  expect(orderId).toBeTruthy();
  await login(page, email);
  await page.goto(`/products/${slug}`);
  await page.getByRole("textbox", { name: "Title", exact: true }).fill(`Review ${suffix}`);
  await page.getByRole("textbox", { name: "Review", exact: true }).fill("Beautiful handmade piece.");
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByRole("status")).toContainText("submitted for staff approval");
  expect((await page.request.get(`/api/reviews?productId=${productId}`).then(r => r.json())).reviews).toHaveLength(0);
  const staff = await browser.newPage({ extraHTTPHeaders: { "x-forwarded-for": `staff-${suffix}` } });
  await login(staff, staffEmail);
  await staff.goto("/admin/reviews");
  // A stale staff decision must never publish a newer, unseen customer edit.
  const edited = await page.request.post("/api/reviews", { data: { productId, rating: 4, title: `Review ${suffix}`, body: "Updated review awaiting a fresh decision." } });
  expect(edited.status()).toBe(201);
  await staff.getByRole("article").filter({ hasText: `Review ${suffix}` }).getByRole("button", { name: "Approve", exact: true }).click();
  await expect(staff.getByRole("alert").filter({ hasText: "This review has changed" })).toBeVisible();
  expect((await page.request.get(`/api/reviews?productId=${productId}`).then(r => r.json())).reviews).toHaveLength(0);
  await staff.reload();
  await staff.getByRole("article").filter({ hasText: `Review ${suffix}` }).getByRole("button", { name: "Approve", exact: true }).click();
  await expect.poll(async () => (await page.request.get(`/api/reviews?productId=${productId}`).then(r => r.json())).reviews.length).toBe(1);
  const revised = await page.request.post("/api/reviews", { data: { productId, rating: 3, title: `Review ${suffix}`, body: "Another edit requires moderation again." } });
  expect(revised.status()).toBe(201);
  expect((await page.request.get(`/api/reviews?productId=${productId}`).then(r => r.json())).reviews).toHaveLength(0);
  await staff.reload();
  await staff.getByRole("article").filter({ hasText: `Review ${suffix}` }).getByRole("button", { name: "Reject", exact: true }).click();
  await expect(staff.getByRole("status")).toContainText("Review rejected");
  await staff.goto("/admin/support");
  const ticket = staff.getByRole("article").filter({ hasText: `Delivery question ${suffix}` });
  await ticket.getByLabel("Reply", { exact: true }).fill("Your delivery is on the way.");
  await ticket.getByRole("combobox", { name: "Status", exact: true }).selectOption("RESOLVED");
  await ticket.getByRole("button", { name: "Update ticket" }).click();
  await expect(ticket.getByText("Status updated to RESOLVED.", { exact: false })).toBeVisible();
  await page.goto("/account/support");
  await expect(page.getByText("Your delivery is on the way.", { exact: false })).toBeVisible();
  await page.getByRole("textbox", { name: "Reply", exact: true }).fill("Thank you. One more question about the date.");
  await page.getByRole("button", { name: "Send reply", exact: true }).click();
  await expect(page.getByText("Thank you. One more question about the date.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await prisma.supportTicket.findFirstOrThrow({ where: { userId: customerId } })).status).toBe("OPEN");
  await staff.goto("/admin/analytics");
  await expect(staff.getByRole("heading", { name: "Low stock alerts (5 or fewer)" })).toBeVisible();
  const completions = await prisma.analyticsEvent.count({ where: { event: "payment_succeeded" } });
  await page.request.post("/api/analytics", { data: { event: "payment_succeeded" } });
  expect(await prisma.analyticsEvent.count({ where: { event: "payment_succeeded" } })).toBe(completions);
  await staff.close();
  const outsider = await browser.newPage({ extraHTTPHeaders: { "x-forwarded-for": `outsider-${suffix}` } });
  await login(outsider, outsiderEmail);
  await outsider.goto("/account/support");
  await expect(outsider.getByText(`Delivery question ${suffix}`, { exact: true })).toHaveCount(0);
  await outsider.goto("/account/addresses");
  await expect(outsider.getByRole("button", { name: "Delete address" })).toHaveCount(0);
  await outsider.goto(`/products/${slug}`);
  await outsider.getByRole("textbox", { name: "Title", exact: true }).fill("Unauthorized review");
  await outsider.getByRole("textbox", { name: "Review", exact: true }).fill("No purchase");
  await outsider.getByRole("button", { name: "Submit review" }).click();
  await expect(outsider.getByRole("status")).toContainText("Only customers who purchased");
  const blockedAdmin = await outsider.request.get("/admin/reviews", { maxRedirects: 0 });
  expect(blockedAdmin.status()).toBe(307);
  expect(blockedAdmin.headers().location).toContain("error=unauthorized");
  await outsider.goto("/admin/reviews");
  // The sign-in page returns already-signed-in customers to their account.
  await expect(outsider).toHaveURL(/\/account$/);
  await expect(outsider.getByRole("heading", { name: "Review moderation", exact: true })).toHaveCount(0);
  await outsider.close();
  await page.goto("/account/addresses");
  const savedAddress = page.locator("section").filter({ has: page.getByRole("button", { name: "Delete address", exact: true }) });
  await savedAddress.getByRole("textbox", { name: "Street address", exact: true }).fill("Updated customer address");
  await savedAddress.getByRole("button", { name: "Save address", exact: true }).click();
  await expect.poll(async () => (await prisma.address.findFirstOrThrow({ where: { userId: customerId, saved: true } })).addressLine1).toBe("Updated customer address");
  await savedAddress.getByRole("button", { name: "Delete address", exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete address", exact: true })).toHaveCount(0);
  const unchangedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { shippingAddress: true } });
  expect(unchangedOrder.shippingAddress?.addressLine1).toBe("Janakpur Road");
});
