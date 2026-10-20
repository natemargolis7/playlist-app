import Link from "next/link";
import { ArrowRight, CalendarCheck, Guitar, Mic2, Palette, Search, Send, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GigCard } from "@/components/gig-card";
import type { Gig, Venue } from "@/lib/types";

type GigRow = Gig & { venues: Pick<Venue, "name" | "city"> | null };

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gigs")
    .select("*, venues(name, city)")
    .eq("status", "open")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(4);
  const gigs = (data ?? []) as GigRow[];

  return (
    <div className="space-y-24">
      <section className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-16 pb-10 sm:-mx-6 sm:-mt-10 sm:px-6 sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand/25 via-brand-2/20 to-brand/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow mb-4 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" /> Live music marketplace
            </p>
            <h1 className="text-5xl leading-[1.05] font-extrabold sm:text-6xl">
              Book live music.{" "}
              <span className="bg-gradient-to-r from-fill to-fill-2 bg-clip-text text-transparent">Get paid to play.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Venues post paid gigs. Musicians show off their sound with a profile that&apos;s all theirs, and apply in one
              click.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?role=musician" className="btn px-5 py-3 text-base">
                <Guitar className="h-5 w-5" /> I&apos;m a musician
              </Link>
              <Link href="/signup?role=venue" className="btn-outline px-5 py-3 text-base">
                <Store className="h-5 w-5" /> I&apos;m a venue
              </Link>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      <section>
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="text-3xl font-bold sm:text-4xl">Two sides, one stage</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Steps
            icon={Mic2}
            title="For musicians"
            steps={[
              [Palette, "Make it yours", "Pick your colors, genres, rate and links, and embed your best tracks."],
              [Search, "Find paid work", "Browse open gigs by date, pay and genre."],
              [Send, "Pitch in one click", "Send a short note and track every application from your dashboard."],
            ]}
            cta={{ href: "/signup?role=musician", label: "Create your profile" }}
          />
          <Steps
            icon={Store}
            title="For venues"
            steps={[
              [CalendarCheck, "Post a gig", "Set the date, set length, genre and what you'll pay."],
              [Search, "Review applicants", "Every applicant comes with a full profile and tracks to hear."],
              [Guitar, "Book the act", "Accept the right fit and the gig is marked filled automatically."],
            ]}
            cta={{ href: "/signup?role=venue", label: "Post your first gig" }}
          />
        </div>
      </section>

      {gigs.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Happening soon</p>
              <h2 className="text-3xl font-bold">Open gigs</h2>
            </div>
            <Link href="/gigs" className="btn-ghost">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {gigs.map((g) => <GigCard key={g.id} gig={g} venue={g.venues} />)}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-fill to-fill-2 px-6 py-14 text-center text-white sm:px-12">
        <h2 className="text-3xl font-bold sm:text-4xl">Your next gig is one profile away</h2>
        <p className="mx-auto mt-3 max-w-md text-white/80">Free to join for musicians and venues.</p>
        <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-brand shadow-lg transition hover:scale-[1.02]">
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function Steps({
  icon: Icon,
  title,
  steps,
  cta,
}: {
  icon: typeof Mic2;
  title: string;
  steps: [typeof Mic2, string, string][];
  cta: { href: string; label: string };
}) {
  return (
    <div className="card p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <ol className="space-y-5">
        {steps.map(([StepIcon, heading, body], i) => (
          <li key={heading} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-muted">
              {i + 1}
            </span>
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <StepIcon className="h-4 w-4 text-brand" /> {heading}
              </p>
              <p className="text-sm text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href={cta.href} className="btn-outline mt-7">
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Illustrative profile + gig cards; not real data. */
function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm select-none sm:mb-16 lg:max-w-none">
      <div className="card overflow-hidden p-0 shadow-2xl shadow-brand/10">
        <div className="h-24 bg-gradient-to-br from-[#f97316] to-[#db2777]" />
        <div className="px-5 pb-5">
          <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-card bg-[#ea580c] font-display text-2xl font-bold text-white">
            M
          </div>
          <p className="mt-2 font-display text-xl font-bold">Marigold Trio</p>
          <p className="text-sm text-muted">Soul &amp; funk for late-night sets</p>
          <div className="mt-3 flex gap-1.5">
            {["soul", "funk", "jazz"].map((g) => (
              <span key={g} className="rounded-full border border-[#ea580c]/40 px-2.5 py-0.5 text-xs text-[#ea580c]">{g}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="card absolute -right-4 -bottom-16 hidden w-64 rotate-[-3deg] shadow-xl sm:block lg:-right-4">
        <p className="text-xs text-muted">The Blue Room · Austin</p>
        <p className="font-semibold">Friday jazz residency</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Fri, 8:00 PM</span>
          <span className="font-semibold text-brand">$450</span>
        </div>
      </div>
      <div className="absolute -top-4 right-3 rotate-[4deg] sm:-right-2 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
        ✓ Booked
      </div>
    </div>
  );
}
