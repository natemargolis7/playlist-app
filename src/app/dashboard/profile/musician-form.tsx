"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Paintbrush, User } from "lucide-react";
import { updateMusician, type FormState } from "@/app/dashboard/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ProfileHeader } from "@/components/profile-header";
import { Combobox } from "@/components/combobox";
import { ImageDropzone } from "@/components/image-dropzone";
import { MultiSelect } from "@/components/multi-select";
import { GENRES, INSTRUMENTS, LOCATIONS } from "@/lib/options";
import type { Musician } from "@/lib/types";

const PRESET_COLORS = ["#e0662b", "#c2187a", "#2f6fdf", "#3f7d4e", "#8a5a2b", "#1f2a44", "#161514"];

export function MusicianForm({ musician }: { musician: Musician }) {
  const [state, action] = useActionState<FormState, FormData>(updateMusician, {});
  const [preview, setPreview] = useState(musician);

  const set = (patch: Partial<Musician>) => setPreview((p) => ({ ...p, ...patch }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form action={action} className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><User className="h-5 w-5 text-brand" /> Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stage name">
              <input className="input" name="stage_name" defaultValue={musician.stage_name}
                onChange={(e) => set({ stage_name: e.target.value })} required />
            </Field>
            <Field label="Profile URL" hint={`/musicians/${preview.slug}`}>
              <input className="input" name="slug" defaultValue={musician.slug}
                onChange={(e) => set({ slug: e.target.value.toLowerCase() })} required />
            </Field>
          </div>
          <Field label="Headline" hint="One line, e.g. “Soul trio for weddings & late-night sets”">
            <input className="input" name="headline" maxLength={120} defaultValue={musician.headline ?? ""}
              onChange={(e) => set({ headline: e.target.value })} />
          </Field>
          <Field label="Bio">
            <textarea className="input min-h-32" name="bio" defaultValue={musician.bio ?? ""} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <Combobox name="location" options={LOCATIONS} defaultValue={musician.location ?? ""}
                placeholder="Start typing a city" onChange={(location) => set({ location })} />
            </Field>
            <Field label="Typical rate (USD per gig)">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted">$</span>
                <input className="input pl-7" name="rate" inputMode="decimal" placeholder="300"
                  defaultValue={musician.rate_cents != null ? musician.rate_cents / 100 : ""}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[$,]/g, ""));
                    set({ rate_cents: e.target.value.trim() && Number.isFinite(n) ? Math.round(n * 100) : null });
                  }} />
              </div>
            </Field>
          </div>
          <Field label="Genres" hint="Pick from the list or type your own and press Enter.">
            <MultiSelect name="genres" options={GENRES} defaultValue={musician.genres} max={8}
              placeholder="Search genres…" onChange={(genres) => set({ genres })} />
          </Field>
          <Field label="Instruments">
            <MultiSelect name="instruments" options={INSTRUMENTS} defaultValue={musician.instruments}
              placeholder="Search instruments…" onChange={(instruments) => set({ instruments })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="available" defaultChecked={musician.available}
              onChange={(e) => set({ available: e.target.checked })} />
            Available for bookings
          </label>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Paintbrush className="h-5 w-5 text-brand" /> Look &amp; feel</h2>
          <Field label="Accent color">
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button key={c} type="button" aria-label={c} onClick={() => set({ accent_color: c })}
                  className={`h-8 w-8 rounded-full border-2 ${preview.accent_color === c ? "border-foreground" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
              <input type="color" name="accent_color" value={preview.accent_color}
                onChange={(e) => set({ accent_color: e.target.value })} className="h-8 w-12 cursor-pointer" />
            </div>
          </Field>
          <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
            <Field label="Profile photo">
              <ImageDropzone name="avatar_url" userId={musician.id} shape="round" defaultUrl={musician.avatar_url}
                hint="Square works best." onChange={(avatar_url) => set({ avatar_url })} />
            </Field>
            <Field label="Banner image">
              <ImageDropzone name="banner_url" userId={musician.id} defaultUrl={musician.banner_url}
                hint="Wide images (about 3:1) look best." onChange={(banner_url) => set({ banner_url })} />
            </Field>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Link2 className="h-5 w-5 text-brand" /> Links &amp; media</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["website", "instagram", "spotify", "youtube", "soundcloud", "bandcamp"] as const).map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
                <input className="input" name={`link_${k}`} type="url" defaultValue={musician.links[k] ?? ""} />
              </Field>
            ))}
          </div>
          <Field label="Featured tracks & videos" hint="One YouTube, Spotify or SoundCloud link per line; they're embedded on your profile">
            <textarea className="input min-h-24 text-sm" name="media_urls" defaultValue={musician.media_urls.join("\n")} />
          </Field>
        </section>

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-floor p-3 text-floor-ink shadow-lg">
          <SubmitButton>Save profile</SubmitButton>
          <Link href={`/musicians/${musician.slug}`} className="btn-ghost text-floor-ink hover:bg-white/10 hover:text-floor-ink">
            <ExternalLink className="h-4 w-4" /> View public profile
          </Link>
          <div className="w-full sm:ml-auto sm:w-auto"><FormMessage {...state} /></div>
        </div>
      </form>

      <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
        <p className="text-sm font-semibold text-muted">Live preview</p>
        <div className="overflow-hidden rounded-2xl bg-card">
          <ProfileHeader musician={preview} compact />
        </div>
      </aside>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
