import Link from "next/link";

const SCALLOPS = 12;

/** The back of the card: a postcard on the stage floor. */
export function Footer() {
  return (
    <footer className="bg-floor px-4 pt-16 text-foreground sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex" aria-hidden>
          {Array.from({ length: SCALLOPS }, (_, i) => (
            <span key={i} className={`h-6 flex-1 rounded-t-full bg-card sm:h-10 ${i >= 6 ? "hidden sm:block" : ""}`} />
          ))}
        </div>
        <div className="grid gap-10 bg-card px-6 pt-10 pb-6 font-display sm:grid-cols-2 sm:px-12 sm:pt-14">
          <div data-reveal>
            <p className="text-4xl leading-none font-semibold tracking-tight">See you at soundcheck.</p>
            <p className="mt-4 max-w-sm text-[length:var(--step-body)]">
              Playlist puts paid gigs and the musicians who play them in one place. The fee is always on the gig.
            </p>
          </div>
          <div className="flex items-start justify-between gap-6" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <ul className="space-y-3 text-[length:var(--step-body)]">
              <li><Link href="/gigs" className="link">Find gigs</Link></li>
              <li><Link href="/musicians" className="link">Browse musicians</Link></li>
              <li><Link href="/signup?role=venue" className="link">Post a gig as a venue</Link></li>
              <li><Link href="/login" className="link">Log in</Link></li>
            </ul>
            <span
              aria-hidden
              className="flex h-28 w-20 shrink-0 rotate-3 items-center justify-center bg-accent text-5xl font-semibold text-accent-ink outline-4 -outline-offset-8 outline-dotted outline-card sm:w-24"
            >
              P
            </span>
          </div>
          <p className="text-center text-[length:var(--step-small)] text-muted sm:col-span-2">© {new Date().getFullYear()} Playlist</p>
        </div>
      </div>
    </footer>
  );
}
