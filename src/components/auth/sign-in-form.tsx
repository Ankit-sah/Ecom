"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { callbackUrl: string };

export function SignInForm({ callbackUrl }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setIsSubmitting(false);

    if (result?.error) {
      setError("Email or password is incorrect.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#31554d]">Email address</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="w-full rounded-xl border border-[#ddcfbb] bg-white px-3 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#b9472f] focus:ring-2 focus:ring-[#b9472f]/15" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#31554d]">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full rounded-xl border border-[#ddcfbb] bg-white px-3 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#b9472f] focus:ring-2 focus:ring-[#b9472f]/15" />
      </div>
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[#b9472f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#923622] disabled:cursor-not-allowed disabled:bg-neutral-300">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
