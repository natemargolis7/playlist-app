/* eslint-disable @next/next/no-img-element -- user-supplied image URLs from any host */
import { notFound } from "next/navigation";
import { CalendarX, Globe, MapPin, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { GigCard } from "@/components/gig-card";
import type { Gig, Venue } from "@/lib/types";

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const venue = data as Venue;

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*")
    .eq("venue_id", id)
    .eq("status", "open")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  return (
    <div className="space-y-10">
      <div className="card flex flex-col gap-6 p-7 sm:flex-row sm:items-center">
        {venue.logo_url ? (
          <img src={venue.logo_url} alt="" className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-fill to-fill-2 font-display text-3xl font-bold text-white">
            {venue.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="eyebrow mb-1">Venue</p>
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {(venue.address || venue.city) && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {[venue.address, venue.city].filter(Boolean).join(", ")}</span>
            )}
            {venue.capacity && <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Capacity {venue.capacity}</span>}
            {venue.website && (
              <a href={venue.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-brand hover:underline">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
          </div>
        </div>
      </div>
      {venue.description && <p className="max-w-3xl leading-relaxed whitespace-pre-line">{venue.description}</p>}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Upcoming open gigs</h2>
        {(gigs ?? []).length === 0 ? (
          <EmptyState icon={CalendarX} title="No open gigs right now" body={`${venue.name} isn't hiring at the moment.`} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {((gigs ?? []) as Gig[]).map((g) => <GigCard key={g.id} gig={g} venue={venue} />)}
          </div>
        )}
      </section>
    </div>
  );
}
