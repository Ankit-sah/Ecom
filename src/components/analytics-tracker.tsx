"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
    const body = JSON.stringify({ event: "page_view", path: pathname });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    else void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
  }, [pathname]);
  return null;
}
