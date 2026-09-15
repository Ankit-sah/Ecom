import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SignInButton } from "@/components/auth/sign-in-button";
import { SignInForm } from "@/components/auth/sign-in-form";
import { authOptions } from "@/lib/auth";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const requested = (await searchParams).callbackUrl;
  const callbackUrl = requested?.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\") ? requested : "/account";
  const session = await getServerSession(authOptions);
  const oktaEnabled = Boolean(process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET && process.env.OKTA_ISSUER);

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md space-y-7 rounded-3xl border border-[#ddcfbb] bg-[#fffdf9] p-7 text-center shadow-xl sm:p-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Welcome back</p>
          <h1 className="font-serif text-3xl font-semibold text-[#242b25]">Sign in to continue</h1>
          <p className="text-sm text-neutral-600">
            Access your profile, track orders, and keep your checkout details ready.
          </p>
        </div>
        <SignInForm callbackUrl={callbackUrl} />
        {oktaEnabled ? <><div className="flex items-center gap-3 text-xs text-neutral-400"><span className="h-px flex-1 bg-[#ddcfbb]" />or<span className="h-px flex-1 bg-[#ddcfbb]" /></div><SignInButton callbackUrl={callbackUrl} /></> : null}
        <p className="text-xs text-neutral-500">
          By continuing you agree to our{" "}
          <a href="#" className="font-medium text-neutral-700 underline-offset-2 hover:underline">
            terms
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-neutral-700 underline-offset-2 hover:underline">
            privacy policy
          </a>
          .
        </p>
        <p className="text-xs text-neutral-500">
          New to Janakpur Art and Craft?{" "}
          <a href="/auth/sign-up" className="font-semibold text-orange-500 underline-offset-2 hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
