"use client";

import { useActionState } from "react";
import { applyToGig, type FormState } from "@/app/gigs/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function ApplyForm({ gigId }: { gigId: string }) {
  const [state, action] = useActionState<FormState, FormData>(applyToGig, {});
  if (state.message) return <FormMessage message={state.message} />;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="gig_id" value={gigId} />
      <textarea className="input min-h-24" name="message" placeholder="Pitch yourself: set list, lineup, why you're a fit…" />
      <FormMessage {...state} />
      <SubmitButton>Apply</SubmitButton>
    </form>
  );
}
