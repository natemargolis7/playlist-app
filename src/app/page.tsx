import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import { Setlist, type SetlistGig } from "@/components/landing/setlist";
import { TapeStripe } from "@/components/tape-stripe";
import type { Gig, Musician, Venue } from "@/lib/types";
import "./landing.css";

type GigRow = Gig & { venues: Pick<Venue, "name" | "city"> | null };

export default async function Home() {
  const supabase = await createClient();
  const [{ data: gigData }, { data: musicianData }] = await Promise.all([
    supabase
      .from("gigs")
      .select("*, venues(name, city)")
      .eq("status", "open")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(60),
    supabase.from("musicians").select("*").eq("available", true).order("updated_at", { ascending: false }).limit(6),
  ]);
  const gigs = (gigData ?? []) as GigRow[];
  const musicians = (musicianData ?? []) as Musician[];

  const setlist: SetlistGig[] = gigs.slice(0, 6).map((g) => ({
    id: g.id,
    title: g.title,
    startsAt: g.starts_at,
    durationMinutes: g.duration_minutes,
    pay: formatMoney(g.pay_cents),
    venue: g.venues?.name ?? "A venue",
    city: g.venues?.city ?? null,
    genres: g.genres,
  }));

  const byCity = new Map<string, GigRow[]>();
  for (const g of gigs) {
    const city = g.venues?.city || "Other cities";
    byCity.set(city, [...(byCity.get(city) ?? []), g]);
  }
  const cities = [...byCity.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 8);

  return (
    <div className="landing">
      {/* The card and the setlist taped to the stage */}
      <section className="hero bleed">
        <div className="hero-card">
          <TapeStripe />
          <div className="hero-card-body">
            <p className="hero-wordmark" aria-hidden data-reveal>Playlist</p>
            <h1 className="hero-title" data-reveal style={{ "--i": 1 } as React.CSSProperties}>Gigs with the fee up front</h1>
            <p className="hero-lead" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
              Venues post the date, the set and what they&apos;ll pay. Musicians pitch with a profile that sounds like
              them, then talk and book in one thread.
            </p>
            <Link href="/gigs" className="btn hero-action" data-reveal style={{ "--i": 3 } as React.CSSProperties}>
              Find a paid gig
            </Link>
          </div>
          <nav className="hero-links" aria-label="Get started">
            <Link href="/signup?role=musician" className="link">Join as a musician</Link>
            <Link href="/signup?role=venue" className="link">Post a gig as a venue</Link>
          </nav>
        </div>
        <div className="hero-floor">
          <Setlist gigs={setlist} />
        </div>
      </section>

      {/* Musicians as slips */}
      {musicians.length > 0 && (
        <section className="slips bleed" aria-labelledby="slips-title">
          <div className="slips-copy">
            <h2 id="slips-title" data-reveal>Profiles that sound like you</h2>
            <p data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              Pick your colour, genres and rate, drag in your photos and embed your best tracks. Every pitch you send
              carries it.
            </p>
          </div>
          <ul className="slips-row">
            {musicians.map((m, i) => (
              <li key={m.id} className="slip" data-reveal style={{ "--i": i, "--h": `${[38, 30, 44, 34, 40, 28][i % 6]}svh`, "--tilt": `${[0, -1.5, 0, 1.2, 0, -1][i % 6]}deg`, "--accent-m": m.accent_color } as React.CSSProperties}>
                <Link href={`/musicians/${m.slug}`} className="slip-link">
                  <span className="slip-band" aria-hidden />
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo from Supabase Storage
                    <img src={m.avatar_url} alt="" width={56} height={56} loading="lazy" className="slip-photo" />
                  ) : (
                    <span className="slip-initial" aria-hidden>{m.stage_name.slice(0, 1)}</span>
                  )}
                  <strong className="slip-name">{m.stage_name}</strong>
                  <span className="slip-cut" aria-hidden>- - - - - - - - - - - -</span>
                  {m.headline && <span>{m.headline}</span>}
                  {m.genres.length > 0 && <span>{m.genres.slice(0, 3).join(", ")}</span>}
                  {m.location && <span>{m.location}</span>}
                  {m.rate_cents != null && <span>From {formatMoney(m.rate_cents)} a gig</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The booking as a run sheet */}
      <section className="runsheet bleed" aria-labelledby="run-title">
        <div className="runsheet-copy">
          <h2 id="run-title" data-reveal>From pitch to booked</h2>
          <p data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            Every gig has one thread between the venue and each musician who pitched. Phone numbers stay private until
            the venue says yes.
          </p>
        </div>
        <div className="runsheet-slip" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          <RunGroup title="The venue posts" rows={[["Date, set length and genres", "on the gig"], ["The fee", "up front"]]} />
          <RunGroup title="You pitch" rows={[["A short note with your profile", "one click"], ["Your tracks, ready to play", "embedded"]]} />
          <RunGroup title="You talk" rows={[["Questions, set lists, load-in", "in the thread"], ["Replies arrive as they're sent", "live"]]} />
          <RunGroup title="You're booked" rows={[["Venue accepts, gig marked filled", "one click"], ["Email and phone shared", "both sides"]]} />
          <p className="runsheet-total">
            <span>On the bill, with each other&apos;s number</span>
            <span>Free</span>
          </p>
        </div>
      </section>

      {/* Open gigs by city */}
      <section className="open bleed" aria-labelledby="open-title">
        <div className="open-list">
          <h2 id="open-title" className="open-word" data-reveal>Open</h2>
          {cities.length > 0 ? (
            <div className="open-bars">
              {cities.map(([city, list], i) => (
                <details key={city} className="open-bar" open={i === 0} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <summary>
                    <span>{city}</span>
                    <span className="open-count">{list.length} {list.length === 1 ? "gig" : "gigs"}</span>
                  </summary>
                  <ul>
                    {list.map((g) => (
                      <li key={g.id}>
                        <Link href={`/gigs/${g.id}`} className="open-gig">
                          <span>
                            <strong>{g.title}</strong>
                            <span className="open-meta">
                              {g.venues?.name} · {new Date(g.starts_at).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </span>
                          </span>
                          <span className="open-pay">{formatMoney(g.pay_cents)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          ) : (
            <p className="open-empty">No open gigs right now. Venues, the first post is yours.</p>
          )}
        </div>
        <div className="open-side" data-reveal>
          <p className="open-figure">
            {gigs.length > 0
              ? `${gigs.length} paid ${gigs.length === 1 ? "gig" : "gigs"} open in ${byCity.size} ${byCity.size === 1 ? "city" : "cities"}.`
              : "No open gigs yet."}
          </p>
          <p>Each one shows the fee, the date and the length of the set before you pitch. Open a city to see them.</p>
          <div className="open-actions">
            <Link href="/gigs" className="btn">See every gig</Link>
            <Link href="/gigs/new" className="btn-outline">Post a gig</Link>
          </div>
        </div>
      </section>

      {/* The reply card */}
      <section className="reply bleed" aria-labelledby="reply-title">
        <p className="reply-note" data-reveal>
          Free for musicians and venues. Make a profile tonight and it&apos;s ready for the next gig that goes up.
        </p>
        <div className="reply-card" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="reply-title">Get on the bill</h2>
          <p>Pick your colours, add your tracks, and pitch the gigs that pay what you&apos;re worth.</p>
          <Link href="/signup?role=musician" className="reply-action">Create a musician profile</Link>
          <Link href="/signup?role=venue" className="link reply-venue">Booking a room? Sign up as a venue</Link>
        </div>
      </section>
    </div>
  );
}

function RunGroup({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="runsheet-group" data-reveal>
      <h3>{title}</h3>
      {rows.map(([what, value]) => (
        <p key={what} className="runsheet-row">
          <span>{what}</span>
          <span className="runsheet-dots" aria-hidden />
          <span>{value}</span>
        </p>
      ))}
    </div>
  );
}
