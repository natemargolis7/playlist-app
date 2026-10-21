"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { updateContact, type ContactState } from "@/app/messages/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { ContactDetails } from "@/lib/types";

export function ContactForm({ contact }: { contact: ContactDetails | null }) {
  const [state, action] = useActionState<ContactState, FormData>(updateContact, {});
  return (
    <form id="contact" action={action} className="card mt-6 max-w-2xl scroll-mt-24 space-y-4 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold"><Lock className="h-5 w-5 text-brand" /> Booking contact</h2>
        <p className="mt-1 text-sm text-muted">Private. Only shown to a venue or musician once you have a confirmed booking together.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="contact_email">Email</label>
          <input className="input" id="contact_email" name="contact_email" type="email" defaultValue={contact?.email ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="contact_phone">Phone</label>
          <input className="input" id="contact_phone" name="contact_phone" type="tel" placeholder="(555) 123-4567" defaultValue={contact?.phone ?? ""} />
        </div>
      </div>
      <label className="flex items-start gap-3 border-t border-border pt-4 text-sm">
        <input type="checkbox" name="email_notifications" defaultChecked={contact?.email_notifications ?? true} className="mt-0.5" />
        <span>
          <span className="font-semibold">Email me about my gigs</span>
          <span className="block text-muted">New applicants, bookings, replies and reminders, sent to the email you signed up with.</span>
        </span>
      </label>
      <FormMessage {...state} />
      <SubmitButton className="btn-outline">Save</SubmitButton>
    </form>
  );
}
