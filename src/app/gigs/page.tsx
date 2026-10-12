import { createClient } from "@/lib/supabase/server";
import { GigCard } from "@/components/gig-card";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">Open gigs</h1>
        <form className="flex gap-2">
          <input className="input w-32" name="genre" placeholder="Genre" defaultValue={genre} />
          <input className="input w-32" name="min_pay" placeholder="Min pay $" inputMode="decimal" defaultValue={min_pay} />
          <button className="btn-outline">Filter</button>
        </form>
      </div>
      {gigs.length === 0 && <p className="text-muted">No open gigs right now. Check back soon.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {gigs.map((g) => <GigCard key={g.id} gig={g} venue={g.venues} />)}
      </div>
    </div>
  );
}
