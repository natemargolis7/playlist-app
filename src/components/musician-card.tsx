import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { Musician } from "@/lib/types";
import { Avatar } from "./avatar";

export function MusicianCard({ musician: m }: { musician: Musician }) {
  return (
    <Link href={`/musicians/${m.slug}`} className="card card-hover group overflow-hidden p-0">
      <div
        className="h-16"
        style={{
          background: m.banner_url
            ? `center / cover no-repeat url("${encodeURI(m.banner_url)}")`
            : `linear-gradient(135deg, ${m.accent_color}, ${m.accent_color}55)`,
        }}
      />
      <div className="px-5 pb-5">
        <div className="-mt-7 flex items-end justify-between">
          <Avatar name={m.stage_name} url={m.avatar_url} color={m.accent_color} className="h-14 w-14 border-4 border-card text-xl" />
          {m.rate_cents != null && <span className="text-sm font-semibold">from {formatMoney(m.rate_cents)}</span>}
        </div>
        <p className="mt-2 truncate font-display text-lg font-bold group-hover:underline">{m.stage_name}</p>
        <p className="line-clamp-1 text-sm text-muted">{m.headline ?? (m.instruments.join(", ") || "Live musician")}</p>
        {m.location && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3" /> {m.location}
          </p>
        )}
        {m.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {m.genres.slice(0, 4).map((g) => (
              <span key={g} className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={{ borderColor: `${m.accent_color}55`, color: m.accent_color }}>
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
