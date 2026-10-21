import { TapeStripe } from "./tape-stripe";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden bg-card lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-floor text-floor-ink lg:flex">
        <TapeStripe />
        <div className="p-10">
          <p className="font-display text-5xl leading-none font-semibold tracking-tight">Playlist</p>
          <p className="mt-6 max-w-xs font-display text-2xl leading-snug">Paid gigs with the fee up front, and the acts who play them.</p>
        </div>
      </div>
      <div className="p-6 sm:p-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 mb-8 text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
