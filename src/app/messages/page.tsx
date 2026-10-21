import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { requireSession } from "@/lib/session";
import type { InboxRow } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { timeAgo } from "@/lib/format";

export default async function MessagesPage() {
  const { supabase, user, profile } = await requireSession();
  const { data } = await supabase.rpc("inbox");
  const rows = (data ?? []) as InboxRow[];

  return (
    <div>
      <PageHeader title="Conversations"
        description={profile.role === "venue" ? "Every application to your gigs starts a conversation." : "Each gig you apply to has its own conversation with the venue."} />
      {rows.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          body={profile.role === "venue" ? "When musicians apply to your gigs, you can message them here." : "Apply to a gig to start a conversation with the venue."}
          action={profile.role === "venue" ? <Link href="/gigs/new" className="btn">Post a gig</Link> : <Link href="/gigs" className="btn">Find gigs</Link>}
        />
      ) : (
        <div className="card divide-y divide-border p-0">
          {rows.map((r) => (
            <Link key={r.application_id} href={`/messages/${r.application_id}`}
              className="flex items-center gap-4 px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-card-2">
              <Avatar name={r.other_name} url={r.other_avatar} color={r.other_color ?? "#161514"} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`truncate ${r.unread ? "font-bold" : "font-semibold"}`}>{r.other_name}</p>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(r.last_at)}</span>
                </div>
                <p className="truncate text-xs text-muted">{r.gig_title}</p>
                <p className={`truncate text-sm ${r.unread ? "text-foreground" : "text-muted"}`}>
                  {r.last_sender === user.id && "You: "}
                  {r.last_body ?? "No messages yet"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {r.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-fill px-1.5 text-xs font-bold text-white">{r.unread}</span>
                )}
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
