"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    const response = await fetch("/api/auth/request-password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json(); setMessage(data.message || "Please try again."); setLoading(false);
  }
  return <form onSubmit={submit} className="space-y-4"><label className="block text-left text-sm font-medium">Email address<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ddcfbb] bg-white px-3 py-3 outline-none focus:border-[#b9472f]" /></label>{message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}<button disabled={loading} className="w-full rounded-xl bg-[#b9472f] px-5 py-3 text-sm font-semibold text-white disabled:bg-neutral-300">{loading ? "Sending…" : "Email reset link"}</button></form>;
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const [password, setPassword] = useState(""); const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json(); setMessage(data.success ? "Your password has been changed. You can now sign in." : data.error); setLoading(false); }
  return <form onSubmit={submit} className="space-y-4"><label className="block text-left text-sm font-medium">New password<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ddcfbb] bg-white px-3 py-3 outline-none focus:border-[#b9472f]" /></label>{message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}<button disabled={loading || !token} className="w-full rounded-xl bg-[#b9472f] px-5 py-3 text-sm font-semibold text-white disabled:bg-neutral-300">{loading ? "Saving…" : "Set new password"}</button></form>;
}

export function VerifyEmailForm({ token }: { token?: string }) {
  const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function verify() { setLoading(true); const response = await fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }); const data = await response.json(); setMessage(data.success ? "Your email address is verified. You can now sign in." : data.error); setLoading(false); }
  return <div className="space-y-4">{message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}<button onClick={verify} disabled={loading || !token} className="w-full rounded-xl bg-[#b9472f] px-5 py-3 text-sm font-semibold text-white disabled:bg-neutral-300">{loading ? "Verifying…" : "Verify email"}</button><Link href="/auth/sign-in" className="block text-sm font-semibold text-orange-600">Go to sign in</Link></div>;
}
