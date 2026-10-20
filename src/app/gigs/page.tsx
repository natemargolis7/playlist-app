import Link from "next/link";
import { CalendarSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GigCard } from "@/components/gig-card";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import type { Gig, Venue } from "@/lib/types";

type GigRow = Gig & { venues: Pick<Venue, "name" | "city"> | null };

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; min_pay?: string }>;
}) {
  const { genre, min_pay } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("gigs")
    .select("*, venues(name, city)")
    .eq("status", "open")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");
  if (genre) query = query.contains("genres", [genre.toLowerCase()]);
  const minPay = Number(min_pay);
  if (min_pay && Number.isFinite(minPay)) query = query.gte("pay_cents", Math.round(minPay * 100));

  const { data } = await query;
  const gigs = (data ?? []) as GigRow[];
  const filtered = Boolean(genre || min_pay);

  return (
    <div>
      <PageHeader eyebrow="Find gigs" title="Open gigs" description="Paid live music slots from venues, soonest first." />
      <FilterBar
        basePath="/gigs"
        values={{ genre, min_pay }}
        fields={[
          { name: "genre", placeholder: "Genre, e.g. jazz" },
          { name: "min_pay", placeholder: "Minimum pay ($)", inputMode: "decimal" },
        ]}
      />
      {gigs.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title={filtered ? "No gigs match those filters" : "No open gigs right now"}
          body={filtered ? "Try a different genre or a lower minimum pay." : "New gigs are posted all the time. Check back soon."}
          action={filtered ? <Link href="/gigs" className="btn-outline">Clear filters</Link> : undefined}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">{gigs.length} {gigs.length === 1 ? "gig" : "gigs"}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {gigs.map((g) => <GigCard key={g.id} gig={g} venue={g.venues} />)}
          </div>
        </>
      )}
    </div>
  );
}
