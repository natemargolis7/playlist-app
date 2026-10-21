import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { Gig, Venue } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  filled: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function GigCard({ gig, venue }: { gig: Gig; venue?: Pick<Venue, "name" | "city"> | null }) {
  const date = new Date(gig.starts_at);
  return (
    <Link href={`/gigs/${gig.id}`} className="card card-hover group flex gap-4">
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-soft text-brand">
        <span className="text-xs font-semibold">{date.toLocaleString("en-US", { month: "short" })}</span>
        <span className="font-display text-2xl leading-none font-bold">{date.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate font-semibold group-hover:text-brand">{gig.title}</p>
          <p className="shrink-0 font-display text-lg font-bold">{formatMoney(gig.pay_cents)}</p>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {venue && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {[venue.name, venue.city].filter(Boolean).join(", ")}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {date.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        {(gig.status !== "open" || gig.genres.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {gig.status !== "open" && (
              <span className={`chip capitalize ${STATUS_STYLES[gig.status] ?? ""}`}>{gig.status}</span>
            )}
            {gig.genres.map((g) => <span key={g} className="chip">{g}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}
