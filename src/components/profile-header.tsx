/* eslint-disable @next/next/no-img-element -- user-supplied image URLs from any host */
import type { Musician } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function ProfileHeader({ musician, compact = false }: { musician: Musician; compact?: boolean }) {
  const accent = musician.accent_color;
  return (
    <div>
      <div
        className={compact ? "h-24" : "h-48"}
        style={{
          background: musician.banner_url
            ? `center / cover no-repeat url("${encodeURI(musician.banner_url)}")`
            : `linear-gradient(135deg, ${accent}, ${accent}55)`,
        }}
      />
      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end gap-4">
          {musician.avatar_url ? (
            <img src={musician.avatar_url} alt="" className="h-20 w-20 rounded-full border-4 border-card object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card text-2xl font-bold text-white"
              style={{ background: accent }}>
              {musician.stage_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          {musician.available && (
            <span className="mb-2 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: accent }}>
              Available
            </span>
          )}
        </div>
        <h1 className={`mt-3 font-bold ${compact ? "text-xl" : "text-3xl"}`}>{musician.stage_name}</h1>
        {musician.headline && <p className="text-muted">{musician.headline}</p>}
        <p className="mt-1 text-sm text-muted">
          {[musician.location, musician.rate_cents != null && `from ${formatMoney(musician.rate_cents)}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {musician.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {musician.genres.map((g) => (
              <span key={g} className="chip" style={{ borderColor: accent, color: accent }}>{g}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
