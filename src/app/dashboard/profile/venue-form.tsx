"use client";

import { useActionState } from "react";
import { updateVenue, type FormState } from "@/app/dashboard/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Combobox } from "@/components/combobox";
import { ImageDropzone } from "@/components/image-dropzone";
import { LOCATIONS } from "@/lib/options";
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
          <Combobox id="city" name="city" options={LOCATIONS} defaultValue={venue.city ?? ""} placeholder="Start typing a city" />
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
        <span className="label">Logo</span>
        <ImageDropzone name="logo_url" userId={venue.id} shape="square" defaultUrl={venue.logo_url} hint="Square works best." />
      </div>
      <FormMessage {...state} />
      <SubmitButton>Save venue</SubmitButton>
    </form>
  );
}
