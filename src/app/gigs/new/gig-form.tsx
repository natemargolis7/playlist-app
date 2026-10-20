"use client";

import { useActionState } from "react";
import { createGig, type FormState } from "@/app/gigs/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { MultiSelect } from "@/components/multi-select";
import { GENRES } from "@/lib/options";

export function GigForm() {
  const [state, action] = useActionState<FormState, FormData>(createGig, {});
  return (
    <form action={action} className="card max-w-2xl space-y-5 p-6 sm:p-8">
      <input type="hidden" name="tz_offset" value={new Date().getTimezoneOffset()} suppressHydrationWarning />
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input className="input" id="title" name="title" placeholder="Friday night jazz trio" required />
      </div>
      <div>
        <label className="label" htmlFor="description">Details</label>
        <textarea className="input min-h-28" id="description" name="description"
          placeholder="Set length, backline provided, load-in time, vibe…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="starts_at">Starts</label>
          <input className="input" id="starts_at" name="starts_at" type="datetime-local" required />
        </div>
        <div>
          <label className="label" htmlFor="duration_minutes">Length (minutes)</label>
          <input className="input" id="duration_minutes" name="duration_minutes" type="number" min={15} step={15} />
        </div>
        <div>
          <label className="label" htmlFor="pay">Pay (USD)</label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted">$</span>
            <input className="input pl-7" id="pay" name="pay" inputMode="decimal" placeholder="300" required />
          </div>
        </div>
      </div>
      <div>
        <span className="label">Genres</span>
        <MultiSelect name="genres" options={GENRES} max={5} placeholder="What should the act play?" />
      </div>
      <FormMessage {...state} />
      <SubmitButton pendingText="Posting…">Post gig</SubmitButton>
    </form>
  );
}
