/* eslint-disable @next/next/no-img-element -- user-supplied image URLs from any host */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import type { Musician } from "@/lib/types";

export default async function MusiciansPage({ searchParams }: { searchParams: Promise<{ genre?: string; q?: string }> }) {
  const { genre, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("musicians").select("*").order("updated_at", { ascending: false }).limit(60);
  if (genre) query = query.contains("genres", [genre.toLowerCase()]);
  if (q) query = query.ilike("stage_name", `%${q.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  const musicians = (data ?? []) as Musician[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">Musicians</h1>
        <form className="flex gap-2">
          <input className="input w-40" name="q" placeholder="Name" defaultValue={q} />
          <input className="input w-32" name="genre" placeholder="Genre" defaultValue={genre} />
          <button className="btn-outline">Search</button>
        </form>
      </div>
      {musicians.length === 0 && <p className="text-muted">No musicians found.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {musicians.map((m) => (
          <Link key={m.id} href={`/musicians/${m.slug}`} className="card flex gap-3 hover:border-brand">
            {m.avatar_url ? (
              <img src={m.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-white"
                style={{ background: m.accent_color }}>
                {m.stage_name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{m.stage_name}</p>
              <p className="truncate text-sm text-muted">{m.headline ?? m.genres.join(", ")}</p>
              <p className="text-xs text-muted">
                {[m.location, m.rate_cents != null && formatMoney(m.rate_cents)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
