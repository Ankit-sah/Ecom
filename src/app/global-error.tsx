"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fbf6ed", color: "#242b25" }}><main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}><section style={{ maxWidth: 480, textAlign: "center" }}><p style={{ color: "#b9472f", fontWeight: 700, letterSpacing: "0.12em" }}>SERVICE TEMPORARILY UNAVAILABLE</p><h1>We could not load the shop.</h1><p>Please try again in a moment. If the issue continues, contact us and we’ll help.</p><button onClick={reset} style={{ border: 0, borderRadius: 999, padding: "12px 20px", background: "#b9472f", color: "white", fontWeight: 700 }}>Try again</button></section></main></body></html>;
}
