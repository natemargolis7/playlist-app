import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12 py-10">
      <section className="space-y-5 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Live music, booked.</h1>
        <p className="mx-auto max-w-xl text-lg text-muted">
          Venues post paid gigs. Musicians build a profile that shows off their sound and apply in one click.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/signup?role=musician" className="btn">
            I&apos;m a musician
          </Link>
          <Link href="/signup?role=venue" className="btn-outline">
            I&apos;m a venue
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Make it yours", "Pick your colors, add your genres, rates, links and embedded tracks."],
          ["Find paid work", "Browse open gigs by date, pay and genre, then pitch the venue directly."],
          ["Book with confidence", "Venues review applicants' profiles and accept the right act."],
        ].map(([title, body]) => (
          <div key={title} className="card">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
