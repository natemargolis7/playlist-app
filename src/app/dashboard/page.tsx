import Link from "next/link";
import { CalendarPlus, Check, ExternalLink, Inbox, Pencil, Search, Send } from "lucide-react";
import { requireSession } from "@/lib/session";
import { applicationStatus, formatDate, formatMoney } from "@/lib/format";
import type { Application, Gig, Musician, Venue } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { GigCard } from "@/components/gig-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireSession();

  if (profile.role === "venue") {
    const { data } = await supabase
      .from("gigs")
      .select("*, applications(status)")
      .eq("venue_id", user.id)
      .order("starts_at", { ascending: false });
    const gigs = (data ?? []) as (Gig & { applications: { status: string }[] })[];
    const now = Date.now();
    const upcoming = gigs.filter((g) => g.status === "open" && new Date(g.starts_at).getTime() > now).length;
    const pending = gigs.reduce((n, g) => n + g.applications.filter((a) => a.status === "pending").length, 0);
    const filled = gigs.filter((g) => g.status === "filled").length;

    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Venue dashboard" title={`Hi, ${profile.display_name}`}>
          <div className="flex gap-2">
            <Link href="/dashboard/profile" className="btn-outline"><Pencil className="h-4 w-4" /> Edit venue</Link>
            <Link href="/gigs/new" className="btn"><CalendarPlus className="h-4 w-4" /> Post a gig</Link>
          </div>
        </PageHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Open upcoming gigs" value={upcoming} />
          <Stat label="Applicants to review" value={pending} />
          <Stat label="Gigs booked" value={filled} />
        </div>
        <section>
          <h2 className="mb-4 text-xl font-bold">Your gigs</h2>
          {gigs.length === 0 ? (
            <EmptyState
              icon={CalendarPlus}
              title="Post your first gig"
              body="Tell musicians when, what you pay and the vibe you're after."
              action={<Link href="/gigs/new" className="btn">Post a gig</Link>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {gigs.map((g) => {
                const waiting = g.applications.filter((a) => a.status === "pending").length;
                return (
                  <div key={g.id} className="relative">
                    <GigCard gig={g} />
                    <span className={`absolute -top-2 right-4 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                      waiting ? "bg-fill text-white" : "border border-border bg-card text-muted"
                    }`}>
                      {waiting ? `${waiting} to review` : `${g.applications.length} applicants`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  const [{ data: me }, { data }] = await Promise.all([
    supabase.from("musicians").select("*").eq("id", user.id).single(),
    supabase
      .from("applications")
      .select("*, gigs(id, title, starts_at, pay_cents, venues(name))")
      .eq("musician_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const musician = me as Musician | null;
  const apps = (data ?? []) as (Application & {
    gigs: Pick<Gig, "id" | "title" | "starts_at" | "pay_cents"> & { venues: Pick<Venue, "name"> };
  })[];

  const checklist = musician
    ? [
        ["Add a headline", !!musician.headline],
        ["Write a bio", !!musician.bio],
        ["Add a photo", !!musician.avatar_url],
        ["List your genres", musician.genres.length > 0],
        ["Set your rate", musician.rate_cents != null],
        ["Add a track or video", musician.media_urls.length > 0],
      ] as const
    : [];
  const done = checklist.filter(([, ok]) => ok).length;
  const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Musician dashboard" title={`Hi, ${profile.display_name}`}>
        <div className="flex flex-wrap gap-2">
          {musician && (
            <Link href={`/musicians/${musician.slug}`} className="btn-outline"><ExternalLink className="h-4 w-4" /> View profile</Link>
          )}
          <Link href="/gigs" className="btn"><Search className="h-4 w-4" /> Find gigs</Link>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat label="Applications sent" value={apps.length} />
        <Stat label="Waiting to hear back" value={apps.filter((a) => applicationStatus(a) === "pending").length} />
        <Stat label="Gigs booked" value={apps.filter((a) => a.status === "accepted").length} />
      </div>

      {pct < 100 && (
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Finish your profile</h2>
              <p className="text-sm text-muted">Complete profiles get booked more often.</p>
            </div>
            <Link href="/dashboard/profile" className="btn-outline"><Pencil className="h-4 w-4" /> Edit profile</Link>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-card-2">
            <div className="h-full rounded-full bg-gradient-to-r from-fill to-fill-2" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {checklist.map(([label, ok]) => (
              <li key={label} className={`flex items-center gap-2 text-sm ${ok ? "text-muted line-through" : ""}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full ${ok ? "bg-emerald-500 text-white" : "border border-border"}`}>
                  {ok && <Check className="h-3 w-3" />}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">Your applications</h2>
        {apps.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No applications yet"
            body="Browse open gigs and send your first pitch."
            action={<Link href="/gigs" className="btn">Find gigs</Link>}
          />
        ) : (
          <div className="card divide-y divide-border p-0">
            {apps.map((a) => (
              <Link key={a.id} href={`/messages/${a.id}`} className="flex items-center gap-4 px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-card-2">
                <Inbox className="hidden h-5 w-5 text-muted sm:block" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.gigs.title}</p>
                  <p className="truncate text-sm text-muted">{a.gigs.venues.name} · {formatDate(a.gigs.starts_at)}</p>
                </div>
                <span className="hidden font-semibold sm:block">{formatMoney(a.gigs.pay_cents)}</span>
                <StatusBadge status={applicationStatus(a)} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
