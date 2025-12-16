import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SignInButton } from "@/components/auth/sign-in-button";
import { authOptions } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-orange-200/70 bg-white/85 p-10 text-center shadow-xl backdrop-blur">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Welcome back</p>
          <h1 className="text-3xl font-semibold text-gray-800">Sign in to continue</h1>
          <p className="text-sm text-neutral-600">
            Use your Okta account to access your profile, manage orders, and enjoy a personalized experience.
          </p>
        </div>
        <SignInButton />
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

