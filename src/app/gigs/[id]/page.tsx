import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Inbox, MapPin, Wallet } from "lucide-react";
import { getSession } from "@/lib/session";
import { formatDate, formatMoney } from "@/lib/format";
import type { Application, Gig, Musician, Venue } from "@/lib/types";
import { setApplicationStatus, setGigStatus } from "@/app/gigs/actions";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { ApplyForm } from "./apply-form";

type ApplicantRow = Application & {
  musicians: Pick<Musician, "slug" | "stage_name" | "headline" | "accent_color" | "avatar_url">;
};

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getSession();

  const { data } = await supabase.from("gigs").select("*, venues(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const gig = data as Gig & { venues: Venue };
  const isOwner = user?.id === gig.venue_id;

  let applicants: ApplicantRow[] = [];
  let myApplication: Application | null = null;
  if (isOwner) {
    const { data: rows } = await supabase
      .from("applications")
      .select("*, musicians(slug, stage_name, headline, accent_color, avatar_url)")
      .eq("gig_id", gig.id)
      .order("created_at");
    applicants = (rows ?? []) as ApplicantRow[];
  } else if (profile?.role === "musician") {
    const { data: row } = await supabase
      .from("applications")
      .select("*")
      .eq("gig_id", gig.id)
      .eq("musician_id", user!.id)
      .maybeSingle();
    myApplication = row as Application | null;
  }

  const facts = [
    { icon: CalendarDays, label: "When", value: formatDate(gig.starts_at) },
    gig.duration_minutes && { icon: Clock, label: "Length", value: `${gig.duration_minutes} min` },
    { icon: MapPin, label: "Where", value: [gig.venues.name, gig.venues.city].filter(Boolean).join(", ") },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <div>
      <Link href={isOwner ? "/dashboard" : "/gigs"} className="btn-ghost -ml-3 mb-4">
        <ArrowLeft className="h-4 w-4" /> {isOwner ? "Your gigs" : "All gigs"}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article className="space-y-8">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link href={`/venues/${gig.venue_id}`} className="text-sm font-medium text-brand hover:underline">
                {gig.venues.name}
              </Link>
              {gig.status !== "open" && <StatusBadge status={gig.status} />}
            </div>
            <h1 className="text-4xl font-bold">{gig.title}</h1>
            {gig.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {gig.genres.map((g) => <span key={g} className="chip">{g}</span>)}
              </div>
            )}
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-card-2 p-4">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted"><Icon className="h-3.5 w-3.5" /> {label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {gig.description && (
            <section>
              <h2 className="mb-2 text-lg font-bold">Details</h2>
              <p className="leading-relaxed whitespace-pre-line text-foreground/90">{gig.description}</p>
            </section>
          )}

          {isOwner && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">
                Applicants <span className="text-muted">({applicants.length})</span>
              </h2>
              {applicants.length === 0 && (
                <EmptyState icon={Inbox} title="No applications yet" body="Musicians who apply will show up here with their profiles." />
              )}
              {applicants.map((a) => (
                <div key={a.id} className="card space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.musicians.stage_name} url={a.musicians.avatar_url} color={a.musicians.accent_color} className="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/musicians/${a.musicians.slug}`} className="font-semibold hover:underline">
                        {a.musicians.stage_name}
                      </Link>
                      {a.musicians.headline && <p className="truncate text-sm text-muted">{a.musicians.headline}</p>}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.message && (
                    <p className="rounded-xl bg-card-2 px-4 py-3 text-sm whitespace-pre-line">{a.message}</p>
                  )}
                  {a.status === "pending" && gig.status === "open" && (
                    <form action={setApplicationStatus} className="flex gap-2">
                      <input type="hidden" name="application_id" value={a.id} />
                      <input type="hidden" name="gig_id" value={gig.id} />
                      <button name="status" value="accepted" className="btn">Accept</button>
                      <button name="status" value="declined" className="btn-outline">Decline</button>
                      <Link href={`/musicians/${a.musicians.slug}`} className="btn-ghost ml-auto">View profile</Link>
                    </form>
                  )}
                </div>
              ))}
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-6">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-muted"><Wallet className="h-4 w-4" /> Pay</p>
              <p className="font-display text-4xl font-bold">{formatMoney(gig.pay_cents)}</p>
            </div>
            <div className="border-t border-border pt-4">
              {isOwner ? (
                <>
                  <p className="mb-3 text-sm font-semibold">Manage this gig</p>
                  <form action={setGigStatus} className="flex flex-wrap gap-2">
                    <input type="hidden" name="gig_id" value={gig.id} />
                    {gig.status !== "open" && <button name="status" value="open" className="btn-outline">Reopen</button>}
                    {gig.status === "open" && <button name="status" value="filled" className="btn-outline">Mark filled</button>}
                    {gig.status !== "cancelled" && <button name="status" value="cancelled" className="btn-ghost text-red-600">Cancel gig</button>}
                  </form>
                </>
              ) : !user ? (
                <>
                  <p className="mb-3 text-sm text-muted">Log in as a musician to apply.</p>
                  <Link href={`/login?next=/gigs/${gig.id}`} className="btn w-full">Log in to apply</Link>
                </>
              ) : profile?.role !== "musician" ? (
                <p className="text-sm text-muted">Only musicians can apply to gigs.</p>
              ) : myApplication ? (
                <div className="space-y-3">
                  <p className="flex items-center justify-between text-sm">
                    Your application <StatusBadge status={myApplication.status} />
                  </p>
                  {myApplication.status === "pending" && (
                    <form action={setApplicationStatus}>
                      <input type="hidden" name="application_id" value={myApplication.id} />
                      <input type="hidden" name="gig_id" value={gig.id} />
                      <button name="status" value="withdrawn" className="btn-outline w-full">Withdraw application</button>
                    </form>
                  )}
                </div>
              ) : gig.status === "open" ? (
                <>
                  <p className="mb-3 text-sm font-semibold">Apply for this gig</p>
                  <ApplyForm gigId={gig.id} />
                </>
              ) : (
                <p className="text-sm text-muted">This gig is no longer taking applications.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
