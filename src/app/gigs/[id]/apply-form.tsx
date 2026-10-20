"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { applyToGig, type FormState } from "@/app/gigs/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export function ApplyForm({ gigId }: { gigId: string }) {
  const [state, action] = useActionState<FormState, FormData>(applyToGig, {});
  if (state.message) return <FormMessage message={state.message} />;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="gig_id" value={gigId} />
      <textarea className="input min-h-28" name="message" placeholder="Pitch yourself: lineup, set list, why you're a fit…" />
      <FormMessage {...state} />
      <SubmitButton className="btn w-full" pendingText="Sending…">
        <Send className="h-4 w-4" /> Send application
      </SubmitButton>
    </form>
  );
}
