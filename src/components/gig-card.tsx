import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/format";
import type { Gig, Venue } from "@/lib/types";

export function GigCard({ gig, venue }: { gig: Gig; venue?: Pick<Venue, "name" | "city"> | null }) {
  return (
    <Link href={`/gigs/${gig.id}`} className="card block space-y-2 hover:border-brand">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{gig.title}</p>
          {venue && <p className="text-sm text-muted">{[venue.name, venue.city].filter(Boolean).join(" · ")}</p>}
        </div>
        <p className="shrink-0 font-semibold text-brand">{formatMoney(gig.pay_cents)}</p>
      </div>
      <p className="text-sm">{formatDate(gig.starts_at)}</p>
      <div className="flex flex-wrap gap-1.5">
        {gig.status !== "open" && <span className="chip uppercase">{gig.status}</span>}
        {gig.genres.map((g) => <span key={g} className="chip">{g}</span>)}
      </div>
    </Link>
  );
}
