"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Failed to create your account. Please try again.");
        return;
      }

      setSuccess(
        "Account created successfully. You can now sign in with your Okta credentials. Redirecting to sign in…",
      );
      setTimeout(() => router.push("/auth/sign-in"), 2500);
      setForm(initialFormState);
    } catch (requestError) {
      console.error(requestError);
      setError("Unexpected error while creating your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600" htmlFor="firstName">
            First name*
          </label>
          <input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            className="w-full rounded-xl border border-orange-200/70 bg-white px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200/60"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600" htmlFor="lastName">
            Last name*
          </label>
          <input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            className="w-full rounded-xl border border-orange-200/70 bg-white px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200/60"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600" htmlFor="email">
          Email address*
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          className="w-full rounded-xl border border-orange-200/70 bg-white px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200/60"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600" htmlFor="password">
            Password*
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full rounded-xl border border-orange-200/70 bg-white px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200/60"
            required
          />
          <p className="text-xs text-neutral-500">Use at least 8 characters with a mix of letters and numbers.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600" htmlFor="confirmPassword">
            Confirm password*
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full rounded-xl border border-orange-200/70 bg-white px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200/60"
            required
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-xl bg-green-50 px-4 py-2 text-xs font-semibold text-green-600">{success}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[orange-500] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[orange-500]/30 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

