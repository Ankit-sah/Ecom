"use client";

import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

type AuthActionsProps = {
  session: Session | null;
  variant?: "default" | "minimal";
};

export function AuthActions({ session, variant = "default" }: AuthActionsProps) {
  const isMinimal = variant === "minimal";

  if (session?.user) {
    const displayName = session.user.name ?? session.user.email ?? "Signed in";
    if (isMinimal) {
      return (
        <div className="flex items-center gap-2 rounded-full border border-text-bg-orange-500/30 bg-white/90 px-3 py-1.5 text-xs font-semibold text-text-bg-orange-500 shadow-sm">
          <span className="truncate max-w-[120px]">Hi, {displayName.split(" ")[0] ?? "friend"}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full bg-text-bg-orange-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-text-orange-600"
          >
            Sign out
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 rounded-full border border-text-bg-orange-500/30 bg-white/85 px-3 py-2 text-sm font-medium text-text-bg-orange-500 shadow-sm backdrop-blur">
        <span className="truncate">
          Welcome, <span className="font-semibold text-text-gray-800">{displayName}</span>
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border border-text-bg-orange-500/40 px-3 py-1 text-xs font-semibold text-text-bg-orange-500 transition hover:border-text-bg-orange-500 hover:text-text-orange-600"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (isMinimal) {
    return (
      <button
        type="button"
        onClick={() => signIn("okta")}
        className="rounded-full bg-text-bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-text-bg-orange-500/30 transition hover:bg-text-orange-600"
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("okta")}
      className="rounded-full bg-text-bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-text-bg-orange-500/30 transition hover:bg-text-orange-600"
    >
      Sign in
    </button>
  );
}

