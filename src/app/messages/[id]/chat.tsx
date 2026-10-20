"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Lock, SendHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markRead, sendMessage } from "@/app/messages/actions";
import { Avatar } from "@/components/avatar";
import type { Message } from "@/lib/types";

type Person = { name: string; avatar: string | null; color: string };
type Bubble = Pick<Message, "body" | "sender_id" | "created_at"> & { id?: string; pitch?: boolean };

export function Chat({
  applicationId,
  userId,
  people,
  pitch,
  initial,
  closedReason,
}: {
  applicationId: string;
  userId: string;
  people: Record<string, Person>;
  pitch: Bubble | null;
  initial: Message[];
  closedReason: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  // Live updates: append messages from the other side as they arrive.
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // Realtime must connect as the signed-in user, or RLS hides every message from it.
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      channel = supabase
        .channel(`messages:${applicationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `application_id=eq.${applicationId}` },
          (payload) => {
            const msg = payload.new as Message;
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            if (msg.sender_id !== userId) markRead(applicationId);
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [applicationId, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function send() {
    const body = draft.trim();
    if (!body || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(applicationId, body);
      if (result.error) return setError(result.error);
      setDraft("");
      const msg = result.message!;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
  }

  const bubbles: Bubble[] = [...(pitch ? [{ ...pitch, pitch: true }] : []), ...messages];

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {bubbles.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No messages yet. Say hello and ask anything about the gig.</p>
        )}
        {bubbles.map((m, i) => {
          const mine = m.sender_id === userId;
          const who = people[m.sender_id];
          const showHead = i === 0 || bubbles[i - 1].sender_id !== m.sender_id;
          return (
            <div key={m.id ?? "pitch"} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <div className="w-8 shrink-0">
                {showHead && who && <Avatar name={who.name} url={who.avatar} color={who.color} className="h-8 w-8 text-xs" />}
              </div>
              <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                {m.pitch && <span className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">Application pitch</span>}
                <p className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                  mine ? "rounded-br-md bg-gradient-to-r from-fill to-fill-2 text-white" : "rounded-bl-md bg-card-2"
                }`}>
                  {m.body}
                </p>
                <span className="mt-1 text-[11px] text-muted">
                  {new Date(m.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {closedReason ? (
        <p className="flex items-center gap-2 border-t border-border px-5 py-4 text-sm text-muted">
          <Lock className="h-4 w-4" /> {closedReason}
        </p>
      ) : (
        <form
          className="border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {error && <p role="alert" className="mb-2 px-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={4000}
              placeholder="Write a message…"
              aria-label="Message"
              className="input max-h-40 min-h-11 flex-1 resize-none"
            />
            <button type="submit" className="btn h-11 w-11 p-0" disabled={pending || !draft.trim()} aria-label="Send">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 px-1 text-[11px] text-muted">Enter to send, Shift+Enter for a new line.</p>
        </form>
      )}
    </>
  );
}
