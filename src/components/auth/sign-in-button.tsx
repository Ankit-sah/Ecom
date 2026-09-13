"use client";

import { signIn } from "next-auth/react";

type Props = {
  label?: string;
  callbackUrl?: string;
};

export function SignInButton({ label = "Sign in with Okta", callbackUrl = "/account" }: Props) {
  return (
    <button
      type="button"
      onClick={() => signIn("okta", { callbackUrl })}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
    >
      {label}
    </button>
  );
}

