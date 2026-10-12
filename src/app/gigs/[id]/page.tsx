import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { formatDate, formatMoney } from "@/lib/format";
import type { Application, Gig, Musician, Venue } from "@/lib/types";
import { setApplicationStatus, setGigStatus } from "@/app/gigs/actions";
import { ApplyForm } from "./apply-form";

type ApplicantRow = Application & { musicians: Pick<Musician, "slug" | "stage_name" | "headline" | "accent_color"> };

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
      .select("*, musicians(slug, stage_name, headline, accent_color)")
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

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <article className="space-y-4">
        <div>
          <p className="text-sm text-muted">
            <Link href={`/venues/${gig.venue_id}`} className="hover:text-brand">{gig.venues.name}</Link>
            {gig.venues.city && ` · ${gig.venues.city}`}
          </p>
          <h1 className="text-3xl font-bold">{gig.title}</h1>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span>📅 {formatDate(gig.starts_at)}</span>
          {gig.duration_minutes && <span>⏱ {gig.duration_minutes} min</span>}
          <span className="font-semibold text-brand">💵 {formatMoney(gig.pay_cents)}</span>
          {gig.status !== "open" && <span className="chip uppercase">{gig.status}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {gig.genres.map((g) => <span key={g} className="chip">{g}</span>)}
        </div>
        {gig.description && <p className="whitespace-pre-line leading-relaxed">{gig.description}</p>}

        {isOwner && (
          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold">Applicants ({applicants.length})</h2>
            {applicants.length === 0 && <p className="text-sm text-muted">No applications yet.</p>}
            {applicants.map((a) => (
              <div key={a.id} className="card space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/musicians/${a.musicians.slug}`} className="font-semibold"
                    style={{ color: a.musicians.accent_color }}>
                    {a.musicians.stage_name}
                  </Link>
                  <span className="chip capitalize">{a.status}</span>
                </div>
                {a.musicians.headline && <p className="text-sm text-muted">{a.musicians.headline}</p>}
                {a.message && <p className="whitespace-pre-line text-sm">{a.message}</p>}
                {a.status === "pending" && gig.status === "open" && (
                  <form action={setApplicationStatus} className="flex gap-2">
                    <input type="hidden" name="application_id" value={a.id} />
                    <input type="hidden" name="gig_id" value={gig.id} />
                    <button name="status" value="accepted" className="btn">Accept</button>
                    <button name="status" value="declined" className="btn-outline">Decline</button>
                  </form>
                )}
              </div>
            ))}
          </section>
        )}
      </article>

      <aside className="card h-fit space-y-3">
        {isOwner ? (
          <>
            <p className="text-sm font-semibold">Manage this gig</p>
            <form action={setGigStatus} className="flex flex-wrap gap-2">
              <input type="hidden" name="gig_id" value={gig.id} />
              {gig.status !== "open" && <button name="status" value="open" className="btn-outline">Reopen</button>}
              {gig.status === "open" && <button name="status" value="filled" className="btn-outline">Mark filled</button>}
              {gig.status !== "cancelled" && <button name="status" value="cancelled" className="btn-outline">Cancel gig</button>}
            </form>
          </>
        ) : !user ? (
          <>
            <p className="text-sm">Sign in as a musician to apply.</p>
            <Link href={`/login?next=/gigs/${gig.id}`} className="btn w-full">Log in</Link>
          </>
        ) : profile?.role !== "musician" ? (
          <p className="text-sm text-muted">Only musicians can apply to gigs.</p>
        ) : myApplication ? (
          <>
            <p className="text-sm">
              You applied. Status: <span className="font-semibold capitalize">{myApplication.status}</span>
            </p>
            {myApplication.status === "pending" && (
              <form action={setApplicationStatus}>
                <input type="hidden" name="application_id" value={myApplication.id} />
                <input type="hidden" name="gig_id" value={gig.id} />
                <button name="status" value="withdrawn" className="btn-outline">Withdraw</button>
              </form>
            )}
          </>
        ) : gig.status === "open" ? (
          <>
            <p className="text-sm font-semibold">Apply for this gig</p>
            <ApplyForm gigId={gig.id} />
          </>
        ) : (
          <p className="text-sm text-muted">This gig is no longer taking applications.</p>
        )}
      </aside>
    </div>
  );
}
