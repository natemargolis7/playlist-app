"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logIn, type AuthState } from "@/app/auth/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(logIn, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <FormMessage {...state} />
      <SubmitButton className="btn w-full py-3" pendingText="Logging in…">Log in</SubmitButton>
      <p className="text-center text-sm text-muted">
        New here? <Link href="/signup" className="font-medium text-brand hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
