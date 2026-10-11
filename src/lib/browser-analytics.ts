type BrowserEvent = "add_to_cart" | "checkout_started" | "payment_started";

// Analytics must never interrupt a cart action or a payment handoff.
export function trackBrowserEvent(event: BrowserEvent, productId?: string) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true" || typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ event, path: window.location.pathname, ...(productId ? { productId } : {}) });
    if (navigator.sendBeacon?.("/api/analytics", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/analytics", {
      method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true,
    }).catch(() => {});
  } catch {
    // Browsers may block analytics or reject a beacon during navigation.
  }
}
