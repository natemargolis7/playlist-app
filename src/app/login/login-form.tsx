"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logIn, type AuthState } from "@/app/auth/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(logIn, {});

  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" required />
      </div>
      <FormMessage {...state} />
      <SubmitButton className="btn w-full">Log in</SubmitButton>
      <p className="text-center text-sm text-muted">
        New here? <Link href="/signup" className="text-brand">Create an account</Link>
      </p>
    </form>
  );
}
