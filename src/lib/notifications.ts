import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import type { Application, Gig, Musician, Venue } from "@/lib/types";

// Database triggers queue rows in public.notifications (see the 20261021 migration).
// This sends them as email through Resend. Without SUPABASE_SERVICE_ROLE_KEY and
// RESEND_API_KEY it does nothing, so local development works without email set up.

type Kind = "new_application" | "respond_reminder" | "accepted" | "declined" | "gig_cancelled" | "message";

interface NotificationRow {
  id: number;
  user_id: string;
  kind: Kind;
  application_id: string;
  created_at: string;
}

type ApplicationDetails = Application & {
  gigs: Pick<Gig, "id" | "title" | "starts_at" | "venue_id"> & { venues: Pick<Venue, "name"> };
  musicians: Pick<Musician, "stage_name">;
};

interface Email {
  subject: string;
  heading: string;
  body: string;
  cta: string;
  href: string;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(iso));
}

function compose(n: NotificationRow, app: ApplicationDetails, lastMessage: { body: string; sender: string } | null): Email | null {
  const gig = app.gigs.title;
  const venue = app.gigs.venues.name;
  const musician = app.musicians.stage_name;
  const when = formatDate(app.gigs.starts_at);
  const conversation = `/messages/${app.id}`;

  switch (n.kind) {
    case "new_application":
      return {
        subject: `${musician} applied to ${gig}`,
        heading: `New applicant for ${gig}`,
        body: `${musician} wants to play ${gig} (${when}).${app.message ? `\n\n"${app.message}"` : ""}\n\nPlease accept or decline by ${formatDay(app.respond_by)}. After that the application closes automatically and ${musician} is told you passed.`,
        cta: "Review applicants",
        href: `/gigs/${app.gigs.id}`,
      };
    case "respond_reminder":
      return {
        subject: `Reply to ${musician} by ${formatDay(app.respond_by)}`,
        heading: `${musician} is waiting to hear back`,
        body: `${musician} applied to ${gig} (${when}). If you don't accept or decline by ${formatDate(app.respond_by)}, the application closes automatically.`,
        cta: "Review applicants",
        href: `/gigs/${app.gigs.id}`,
      };
    case "accepted":
      return {
        subject: `You're booked: ${gig}`,
        heading: `${venue} booked you`,
        body: `You're playing ${gig} on ${when}. You can now see each other's booking email and phone in your conversation.`,
        cta: "Open conversation",
        href: conversation,
      };
    case "declined": {
      const reasons: Record<string, string> = {
        expired: `${venue} didn't answer in time, so your application to ${gig} has closed.`,
        gig_filled: `${venue} booked someone else for ${gig}.`,
        gig_cancelled: `${venue} cancelled ${gig}.`,
      };
      const reason = reasons[app.closed_reason ?? ""];
      return {
        subject: app.closed_reason === "expired" ? `Your application to ${gig} closed` : `Update on ${gig}`,
        heading: `Update on ${gig}`,
        body: `${reason ?? `${venue} passed on your application for ${gig}.`} There are more open gigs waiting for you.`,
        cta: "Find more gigs",
        href: "/gigs",
      };
    }
    case "gig_cancelled":
      return {
        subject: `${venue} cancelled ${gig}`,
        heading: `${gig} was cancelled`,
        body: `${venue} cancelled ${gig}, which was booked for ${when}. Message them if you have questions.`,
        cta: "Open conversation",
        href: conversation,
      };
    case "message":
      if (!lastMessage) return null;
      return {
        subject: `New message from ${lastMessage.sender} about ${gig}`,
        heading: `${lastMessage.sender} sent you a message`,
        body: `"${lastMessage.body.length > 400 ? `${lastMessage.body.slice(0, 400)}…` : lastMessage.body}"`,
        cta: "Reply",
        href: conversation,
      };
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function render(email: Email) {
  const url = `${SITE_URL}${email.href}`;
  const settings = `${SITE_URL}/dashboard/profile#contact`;
  const paragraphs = email.body
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(p)}</p>`)
    .join("");
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
<p style="margin:0 0 24px;font-weight:700;color:#7c3aed">Playlist</p>
<h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(email.heading)}</h1>
${paragraphs}
<p style="margin:24px 0"><a href="${url}" style="background:#7c3aed;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(email.cta)}</a></p>
<p style="margin:32px 0 0;font-size:12px;color:#666">You're getting this because you have a Playlist account. <a href="${settings}" style="color:#666">Turn off emails</a></p>
</div>`;
  const text = `${email.heading}\n\n${email.body}\n\n${email.cta}: ${url}\n\nTurn off emails: ${settings}`;
  return { html, text };
}

async function sendEmail(to: string, email: Email) {
  const { html, text } = render(email);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Playlist <onboarding@resend.dev>", to, subject: email.subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function deliver(admin: SupabaseClient, n: NotificationRow): Promise<string | null> {
  const [{ data: app }, { data: contact }, { data: userData }] = await Promise.all([
    admin
      .from("applications")
      .select("*, gigs(id, title, starts_at, venue_id, venues(name)), musicians(stage_name)")
      .eq("id", n.application_id)
      .maybeSingle(),
    admin.from("contact_details").select("email_notifications").eq("user_id", n.user_id).maybeSingle(),
    admin.auth.admin.getUserById(n.user_id),
  ]);
  if (!app) return "application deleted";
  if (contact && contact.email_notifications === false) return "opted out";
  const to = userData.user?.email;
  if (!to) return "no email on account";

  let lastMessage: { body: string; sender: string } | null = null;
  if (n.kind === "message") {
    const details = app as ApplicationDetails;
    const { data: msg } = await admin
      .from("messages")
      .select("body, sender_id, created_at")
      .eq("application_id", n.application_id)
      .neq("sender_id", n.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!msg) return "no message";
    // Skip if they already opened the conversation after it arrived.
    const { data: read } = await admin
      .from("conversation_reads")
      .select("last_read_at")
      .eq("application_id", n.application_id)
      .eq("user_id", n.user_id)
      .maybeSingle();
    if (read && new Date(read.last_read_at) >= new Date(msg.created_at)) return "already read";
    lastMessage = {
      body: msg.body,
      sender: msg.sender_id === details.gigs.venue_id ? details.gigs.venues.name : details.musicians.stage_name,
    };
  }

  const email = compose(n, app as ApplicationDetails, lastMessage);
  if (!email) return "nothing to send";
  await sendEmail(to, email);
  return null;
}

/** Close overdue applications, then email everything queued. Safe to call often and concurrently. */
export async function flushNotifications() {
  const admin = createAdminClient();
  if (!admin) return;

  const { error: sweepError } = await admin.rpc("sweep_applications");
  if (sweepError) console.error("sweep_applications failed", sweepError);
  if (!process.env.RESEND_API_KEY) return;

  const { data, error } = await admin.rpc("claim_notifications", { p_limit: 50 });
  if (error) {
    console.error("claim_notifications failed", error);
    return;
  }

  for (const n of (data ?? []) as NotificationRow[]) {
    try {
      const skipped = await deliver(admin, n);
      await admin.from("notifications").update({ sent_at: new Date().toISOString(), last_error: skipped }).eq("id", n.id);
    } catch (e) {
      // Left unsent; claim_notifications retries it in 10 minutes, up to 5 attempts.
      console.error("notification failed", n.id, e);
      await admin.from("notifications").update({ last_error: String(e).slice(0, 500) }).eq("id", n.id);
    }
  }
}
