"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/auth/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { Role } from "@/lib/types";

export function SignupForm({ initialRole }: { initialRole: Role }) {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});
  const [role, setRole] = useState<Role>(initialRole);

  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-2">
        {(["musician", "venue"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg border px-3 py-3 text-sm font-semibold capitalize ${
              role === r ? "border-brand bg-brand/10 text-brand" : "border-border"
            }`}
          >
            {r === "musician" ? "🎸 Musician" : "🏛️ Venue"}
          </button>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="display_name">
          {role === "musician" ? "Stage or band name" : "Venue name"}
        </label>
        <input className="input" id="display_name" name="display_name" required />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" minLength={8} required />
      </div>
      <FormMessage {...state} />
      <SubmitButton className="btn w-full">Create account</SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="text-brand">Log in</Link>
      </p>
    </form>
  );
}
