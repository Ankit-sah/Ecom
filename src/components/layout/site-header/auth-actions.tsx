"use client";

import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

export function AuthActions({ session }: { session: Session | null }) {
  if (session?.user) {
    const displayName = session.user.name ?? session.user.email ?? "Signed in";
    return (
      <div className="flex items-center gap-3 rounded-full border border-[#8a2040]/30 bg-white/85 px-3 py-2 text-sm font-medium text-[#8a2040] shadow-sm backdrop-blur">
        <span className="truncate">
          Welcome, <span className="font-semibold text-[#40111f]">{displayName}</span>
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border border-[#8a2040]/40 px-3 py-1 text-xs font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("okta")}
      className="rounded-full bg-[#8a2040] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#8a2040]/30 transition hover:bg-[#6f1731]"
    >
      Sign in
    </button>
  );
}

