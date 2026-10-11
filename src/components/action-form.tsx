"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";

export type FormActionResult = {
  error?: string;
  success?: string;
};

type ActionFormProps = {
  action: (data: FormData) => Promise<FormActionResult>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
};

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, submit, pending] = useActionState(
    async (_previous: FormActionResult, data: FormData) => {
      return action(data);
    },
    {},
  );

  useEffect(() => {
    if (result.success && resetOnSuccess) formRef.current?.reset();
  }, [result, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      method="post"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const data = new FormData(event.currentTarget, submitter);
        // Dispatch explicitly so React does not clear uncontrolled fields after
        // a server validation error. Only successful opt-in forms are reset.
        startTransition(() => submit(data));
      }}
    >
      <fieldset disabled={pending} className={`min-w-0 ${className ?? ""}`}>
        {children}
        {pending ? (
          <p role="status" className="text-sm text-gray-600 sm:col-span-2">
            Saving…
          </p>
        ) : result.error ? (
          <p role="alert" className="text-sm text-red-700 sm:col-span-2">
            {result.error}
          </p>
        ) : result.success ? (
          <p role="status" className="text-sm text-green-800 sm:col-span-2">
            {result.success}
          </p>
        ) : null}
      </fieldset>
    </form>
  );
}
