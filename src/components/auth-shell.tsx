import { AudioLines } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-brand/5 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-fill to-fill-2 p-10 text-white lg:flex">
        <div aria-hidden className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <AudioLines className="h-8 w-8" />
        <div>
          <p className="font-display text-3xl leading-tight font-bold">Where venues find their sound.</p>
          <p className="mt-3 text-white/80">Paid gigs for live musicians, and great acts for every room.</p>
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
