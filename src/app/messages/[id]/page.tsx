import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Lock, Mail, Phone, Wallet } from "lucide-react";
import { requireSession } from "@/lib/session";
import { applicationStatus, formatDate, formatMoney } from "@/lib/format";
import type { Application, ContactDetails, Gig, Message, Musician, Venue } from "@/lib/types";
import { setApplicationStatus } from "@/app/gigs/actions";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { Chat } from "./chat";

type Row = Application & {
  gigs: Pick<Gig, "id" | "title" | "starts_at" | "pay_cents" | "status" | "venue_id"> & {
    venues: Pick<Venue, "id" | "name" | "logo_url" | "city">;
  };
  musicians: Pick<Musician, "id" | "slug" | "stage_name" | "avatar_url" | "accent_color">;
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireSession();

  const { data } = await supabase
    .from("applications")
    .select("*, gigs(id, title, starts_at, pay_cents, status, venue_id, venues(id, name, logo_url, city)), musicians(id, slug, stage_name, avatar_url, accent_color)")
    .eq("id", id)
    .maybeSingle();
  // RLS only returns applications this user is part of.
  if (!data) notFound();
  const app = data as Row;
  const isVenue = app.gigs.venue_id === user.id;
  const venue = app.gigs.venues;
  const musician = app.musicians;
  const otherId = isVenue ? musician.id : venue.id;

  const [{ data: messages }, { data: contact }] = await Promise.all([
    supabase.from("messages").select("*").eq("application_id", id).order("created_at"),
    // Only returns a row once the application is accepted (see has_booking_with in the migration).
    supabase.from("contact_details").select("*").eq("user_id", otherId).maybeSingle(),
  ]);
  await supabase
    .from("conversation_reads")
    .upsert({ application_id: id, user_id: user.id, last_read_at: new Date().toISOString() });

  const status = applicationStatus(app);
  const open = status === "pending" || status === "accepted";
  const closedReasons: Record<string, string> = {
    expired: `${venue.name} didn't answer in time, so this application and conversation are closed.`,
    gig_filled: "The gig was filled, so this conversation is closed.",
    gig_cancelled: "The gig was cancelled, so this conversation is closed.",
    declined: "This application was declined, so the conversation is closed.",
    withdrawn: "This application was withdrawn, so the conversation is closed.",
  };
  const closedReason = closedReasons[status === "expired" ? "expired" : (app.closed_reason ?? app.status)];
  const other = isVenue
    ? { name: musician.stage_name, avatar: musician.avatar_url, color: musician.accent_color, href: `/musicians/${musician.slug}` }
    : { name: venue.name, avatar: venue.logo_url, color: "#7c3aed", href: `/venues/${venue.id}` };
  const people = {
    [musician.id]: { name: musician.stage_name, avatar: musician.avatar_url, color: musician.accent_color },
    [venue.id]: { name: venue.name, avatar: venue.logo_url, color: "#7c3aed" },
  };
  const c = contact as ContactDetails | null;

  return (
    <div>
      <Link href="/messages" className="btn-ghost -ml-3 mb-4"><ArrowLeft className="h-4 w-4" /> All conversations</Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card flex h-[calc(100vh-14rem)] min-h-[480px] flex-col p-0">
          <header className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Avatar name={other.name} url={other.avatar} color={other.color} className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <Link href={other.href} className="font-semibold hover:underline">{other.name}</Link>
              <p className="truncate text-xs text-muted">{app.gigs.title}</p>
            </div>
            <StatusBadge status={status} />
          </header>
          <Chat
            applicationId={id}
            userId={user.id}
            people={people}
            pitch={app.message ? { body: app.message, sender_id: musician.id, created_at: app.created_at } : null}
            initial={(messages ?? []) as Message[]}
            closedReason={open ? null : closedReason}
          />
        </section>

        <aside className="space-y-4">
          <div className="card space-y-3">
            <p className="text-sm font-semibold">Gig</p>
            <Link href={`/gigs/${app.gigs.id}`} className="block font-display text-lg font-bold hover:underline">{app.gigs.title}</Link>
            <p className="flex items-center gap-2 text-sm text-muted"><CalendarDays className="h-4 w-4" /> {formatDate(app.gigs.starts_at)}</p>
            <p className="flex items-center gap-2 text-sm text-muted"><Wallet className="h-4 w-4" /> {formatMoney(app.gigs.pay_cents)}</p>
            {status === "pending" && (
              <p className="text-sm text-muted">
                {isVenue ? `Answer by ${formatDate(app.respond_by)}, or this application closes automatically.` : `${venue.name} has until ${formatDate(app.respond_by)} to answer.`}
              </p>
            )}
            {isVenue && status === "pending" && app.gigs.status === "open" && (
              <form action={setApplicationStatus} className="flex gap-2 pt-2">
                <input type="hidden" name="application_id" value={app.id} />
                <input type="hidden" name="gig_id" value={app.gigs.id} />
                <button name="status" value="accepted" className="btn flex-1">Book {musician.stage_name}</button>
                <button name="status" value="declined" className="btn-outline">Decline</button>
              </form>
            )}
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-semibold">Contact details</p>
            {app.status === "accepted" && c && (c.email || c.phone) ? (
              <>
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-brand hover:underline"><Mail className="h-4 w-4" /> {c.email}</a>}
                {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm text-brand hover:underline"><Phone className="h-4 w-4" /> {c.phone}</a>}
              </>
            ) : app.status === "accepted" ? (
              <p className="text-sm text-muted">{other.name} hasn&apos;t added contact details yet. Message them here instead.</p>
            ) : (
              <p className="flex gap-2 text-sm text-muted">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                {isVenue ? "You'll both see each other's email and phone once you book this musician." : "You'll both see each other's email and phone once the venue books you."}
              </p>
            )}
            <Link href="/dashboard/profile#contact" className="block text-xs text-muted hover:text-foreground">Edit your own contact details</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
