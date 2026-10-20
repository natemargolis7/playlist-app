import { CheckCircle2, MapPin, Wallet } from "lucide-react";
import type { Musician } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Avatar } from "./avatar";

export function ProfileHeader({ musician, compact = false }: { musician: Musician; compact?: boolean }) {
  const accent = musician.accent_color;
  return (
    <div>
      <div
        className={compact ? "h-24" : "h-44 sm:h-56"}
        style={{
          background: musician.banner_url
            ? `center / cover no-repeat url("${encodeURI(musician.banner_url)}")`
            : `radial-gradient(circle at 20% 20%, ${accent}, transparent 60%), linear-gradient(135deg, ${accent}cc, ${accent}33)`,
        }}
      />
      <div className={compact ? "px-5 pb-5" : "px-6 pb-7 sm:px-8"}>
        <div className={`flex items-end justify-between gap-3 ${compact ? "-mt-10" : "-mt-14"}`}>
          <Avatar
            name={musician.stage_name || "?"}
            url={musician.avatar_url}
            color={accent}
            className={`border-4 border-card shadow-lg ${compact ? "h-20 w-20 text-2xl" : "h-28 w-28 text-4xl"}`}
          />
          {musician.available && (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm" style={{ background: accent }}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Available for bookings
            </span>
          )}
        </div>
        <h1 className={`mt-3 font-bold ${compact ? "text-xl" : "text-3xl sm:text-4xl"}`}>{musician.stage_name}</h1>
        {musician.headline && <p className={`text-muted ${compact ? "text-sm" : "mt-1 text-lg"}`}>{musician.headline}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {musician.location && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {musician.location}</span>
          )}
          {musician.rate_cents != null && (
            <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4" /> from {formatMoney(musician.rate_cents)}</span>
          )}
        </div>
        {musician.genres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {musician.genres.map((g) => (
              <span key={g} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${accent}1f`, color: accent }}>
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
