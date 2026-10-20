import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { MusicianCard } from "@/components/musician-card";
import { PageHeader } from "@/components/page-header";
import type { Musician } from "@/lib/types";

export default async function MusiciansPage({ searchParams }: { searchParams: Promise<{ genre?: string; q?: string }> }) {
  const { genre, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("musicians").select("*").order("updated_at", { ascending: false }).limit(60);
  if (genre) query = query.contains("genres", [genre.toLowerCase()]);
  if (q) query = query.ilike("stage_name", `%${q.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  const musicians = (data ?? []) as Musician[];
  const filtered = Boolean(genre || q);

  return (
    <div>
      <PageHeader eyebrow="Discover" title="Musicians" description="Bands, solo artists and DJs ready to play your room." />
      <FilterBar
        basePath="/musicians"
        values={{ q, genre }}
        fields={[
          { name: "q", placeholder: "Search by name" },
          { name: "genre", placeholder: "Genre" },
        ]}
      />
      {musicians.length === 0 ? (
        <EmptyState
          icon={Users}
          title={filtered ? "No musicians match that search" : "No musicians yet"}
          body={filtered ? "Try another name or genre." : "Be the first to create a profile."}
          action={
            filtered ? (
              <Link href="/musicians" className="btn-outline">Clear search</Link>
            ) : (
              <Link href="/signup?role=musician" className="btn">Create a profile</Link>
            )
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.map((m) => <MusicianCard key={m.id} musician={m} />)}
        </div>
      )}
    </div>
  );
}
