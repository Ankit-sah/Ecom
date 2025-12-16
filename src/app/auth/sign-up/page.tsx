import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="w-full max-w-xl space-y-10 rounded-3xl border border-orange-200/70 bg-white/85 p-10 shadow-lg backdrop-blur">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">Create an account</p>
          <h1 className="text-3xl font-semibold text-gray-800">Join Janakpur Art and Craft</h1>
          <p className="text-sm text-neutral-600">
            Sign up to save your orders, track shipments, and receive artisan stories from the Mithila community.
          </p>
        </div>
        <SignUpForm />
        <p className="text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <Link className="font-semibold text-orange-500 underline-offset-2 hover:underline" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

