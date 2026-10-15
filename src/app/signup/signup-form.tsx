"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Guitar, Store } from "lucide-react";
import { signUp, type AuthState } from "@/app/auth/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { Role } from "@/lib/types";

const ROLES = [
  { value: "musician", icon: Guitar, title: "Musician", body: "Find and apply to gigs" },
  { value: "venue", icon: Store, title: "Venue", body: "Post gigs and book acts" },
] as const;

export function SignupForm({ initialRole }: { initialRole: Role }) {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});
  const [role, setRole] = useState<Role>(initialRole);

  if (state.message) return <FormMessage message={state.message} />;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <fieldset>
        <legend className="label">I am a…</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, icon: Icon, title, body }) => {
            const selected = role === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setRole(value)}
                className={`relative rounded-2xl border-2 p-4 text-left transition ${
                  selected ? "border-brand bg-brand-soft" : "border-border hover:border-brand/40"
                }`}
              >
                {selected && (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-fill text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <Icon className={`mb-2 h-6 w-6 ${selected ? "text-brand" : "text-muted"}`} />
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted">{body}</p>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="display_name">{role === "musician" ? "Stage or band name" : "Venue name"}</label>
        <input className="input" id="display_name" name="display_name" required
          placeholder={role === "musician" ? "e.g. Marigold Trio" : "e.g. The Blue Room"} />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
      </div>
      <FormMessage {...state} />
      <SubmitButton className="btn w-full py-3" pendingText="Creating account…">Create account</SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="font-medium text-brand hover:underline">Log in</Link>
      </p>
    </form>
  );
}
