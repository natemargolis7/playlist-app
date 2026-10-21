"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export interface SetlistGig {
  id: string;
  title: string;
  startsAt: string;
  durationMinutes: number | null;
  pay: string;
  venue: string;
  city: string | null;
  genres: string[];
}

const day = (iso: string) => new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
const time = (iso: string) => new Date(iso).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });

/**
 * The week's open gigs written up as a setlist taped to the stage floor.
 * Pointing at a row (or tabbing to it) pulls out a stub with the details, level with the row.
 */
export function Setlist({ gigs }: { gigs: SetlistGig[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  const show = (i: number, row: HTMLElement) => {
    setActive(i);
    setOffset(row.offsetTop + row.offsetHeight / 2);
  };

  const gig = active != null ? gigs[active] : null;

  return (
    <div className="setlist-wrap" onPointerLeave={() => setActive(null)}>
      <div className="setlist">
        <span className="tape tape-left" aria-hidden />
        <span className="tape tape-right" aria-hidden />
        <p className="setlist-head">
          <span>Open gigs</span>
          <span>Fee</span>
        </p>
        {gigs.length === 0 ? (
          <p className="setlist-empty">Nothing open yet. The first venue to post gets the top line.</p>
        ) : (
          <ol ref={listRef} className={`setlist-rows${active != null ? " is-pointing" : ""}`}>
            {gigs.map((g, i) => (
              <li key={g.id} className={active === i ? "is-active" : undefined}>
                <Link
                  href={`/gigs/${g.id}`}
                  className="setlist-row"
                  onPointerEnter={(e) => show(i, e.currentTarget.parentElement!)}
                  onFocus={(e) => show(i, e.currentTarget.parentElement!)}
                  onBlur={() => setActive(null)}
                >
                  <span className="setlist-title">{g.title}</span>
                  <span className="setlist-pay">{g.pay}</span>
                  <span className="setlist-meta">
                    {day(g.startsAt)} · {g.venue}
                    {g.city ? `, ${g.city.split(",")[0]}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
        <Link href="/gigs" className="setlist-more link">Every open gig</Link>
      </div>

      <div className={`stub${gig ? " is-open" : ""}`} style={{ "--y": `${offset}px` } as React.CSSProperties} aria-hidden>
        {gig && (
          <>
            <p className="stub-day">{new Date(gig.startsAt).getDate()}</p>
            <p className="stub-month">{new Date(gig.startsAt).toLocaleString("en-US", { weekday: "long" })}, {new Date(gig.startsAt).toLocaleString("en-US", { month: "long" })}</p>
            <p>On at {time(gig.startsAt)}</p>
            {gig.durationMinutes && <p>{gig.durationMinutes} minute set</p>}
            {gig.genres.length > 0 && <p>{gig.genres.join(", ")}</p>}
            <p className="stub-pay">{gig.pay}</p>
          </>
        )}
      </div>
    </div>
  );
}
