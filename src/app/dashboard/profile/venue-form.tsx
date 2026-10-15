"use client";

import { useActionState } from "react";
import { updateVenue, type FormState } from "@/app/dashboard/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { Venue } from "@/lib/types";

export function VenueForm({ venue }: { venue: Venue }) {
  const [state, action] = useActionState<FormState, FormData>(updateVenue, {});
  return (
    <form action={action} className="card max-w-2xl space-y-5 p-6 sm:p-8">
      <div>
        <label className="label" htmlFor="name">Venue name</label>
        <input className="input" id="name" name="name" defaultValue={venue.name} required />
      </div>
      <div>
        <label className="label" htmlFor="description">About the venue</label>
        <textarea className="input min-h-28" id="description" name="description" defaultValue={venue.description ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="address">Address</label>
          <input className="input" id="address" name="address" defaultValue={venue.address ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input className="input" id="city" name="city" defaultValue={venue.city ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="capacity">Capacity</label>
          <input className="input" id="capacity" name="capacity" type="number" min={1} defaultValue={venue.capacity ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="website">Website</label>
          <input className="input" id="website" name="website" type="url" defaultValue={venue.website ?? ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="logo_url">Logo URL</label>
        <input className="input" id="logo_url" name="logo_url" type="url" defaultValue={venue.logo_url ?? ""} />
      </div>
      <FormMessage {...state} />
      <SubmitButton>Save venue</SubmitButton>
    </form>
  );
}
