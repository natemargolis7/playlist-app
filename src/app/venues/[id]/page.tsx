/* eslint-disable @next/next/no-img-element -- user-supplied image URLs from any host */
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {venue.logo_url && <img src={venue.logo_url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
        <div>
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <p className="text-muted">
            {[venue.address, venue.city, venue.capacity && `capacity ${venue.capacity}`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      {venue.description && <p className="max-w-2xl whitespace-pre-line">{venue.description}</p>}
      {venue.website && (
        <a href={venue.website} target="_blank" rel="noopener noreferrer nofollow" className="text-brand">
          Website ↗
        </a>
      )}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming open gigs</h2>
        {(gigs ?? []).length === 0 && <p className="text-sm text-muted">None right now.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {((gigs ?? []) as Gig[]).map((g) => <GigCard key={g.id} gig={g} />)}
        </div>
      </section>
    </div>
  );
}
