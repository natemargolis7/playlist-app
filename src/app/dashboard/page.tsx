import Link from "next/link";
import { requireSession } from "@/lib/session";
import { GigCard } from "@/components/gig-card";
import { formatDate } from "@/lib/format";
import type { Application, Gig, Venue } from "@/lib/types";

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireSession();

  if (profile.role === "venue") {
    const { data } = await supabase
      .from("gigs")
      .select("*, applications(count)")
      .eq("venue_id", user.id)
      .order("starts_at", { ascending: false });
    const gigs = (data ?? []) as (Gig & { applications: { count: number }[] })[];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your gigs</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/profile" className="btn-outline">Edit venue</Link>
            <Link href="/gigs/new" className="btn">Post a gig</Link>
          </div>
        </div>
        {gigs.length === 0 && <p className="text-muted">You haven&apos;t posted any gigs yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {gigs.map((g) => (
            <div key={g.id} className="space-y-1">
              <GigCard gig={g} />
              <p className="px-1 text-xs text-muted">{g.applications[0]?.count ?? 0} applicants</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { data: me } = await supabase.from("musicians").select("slug").eq("id", user.id).single();
  const { data } = await supabase
    .from("applications")
    .select("*, gigs(id, title, starts_at, venues(name))")
    .eq("musician_id", user.id)
    .order("created_at", { ascending: false });
  const apps = (data ?? []) as (Application & {
    gigs: Pick<Gig, "id" | "title" | "starts_at"> & { venues: Pick<Venue, "name"> };
  })[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Hi, {profile.display_name}</h1>
        <div className="flex gap-2">
          {me && <Link href={`/musicians/${me.slug}`} className="btn-outline">View profile</Link>}
          <Link href="/dashboard/profile" className="btn-outline">Edit profile</Link>
          <Link href="/gigs" className="btn">Find gigs</Link>
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your applications</h2>
        {apps.length === 0 && <p className="text-muted">No applications yet. Browse open gigs to get started.</p>}
        {apps.map((a) => (
          <Link key={a.id} href={`/gigs/${a.gigs.id}`} className="card flex items-center justify-between gap-3 hover:border-brand">
            <div>
              <p className="font-semibold">{a.gigs.title}</p>
              <p className="text-sm text-muted">{a.gigs.venues.name} · {formatDate(a.gigs.starts_at)}</p>
            </div>
            <span className="chip capitalize">{a.status}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
