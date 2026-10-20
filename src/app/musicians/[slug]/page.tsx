import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile-header";
import { toEmbedUrl } from "@/lib/format";
import { ExternalLink, Headphones } from "lucide-react";
import type { Musician } from "@/lib/types";

async function getMusician(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("musicians").select("*").eq("slug", slug).maybeSingle();
  return data as Musician | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = await getMusician((await params).slug);
  return { title: m ? `${m.stage_name} · Playlist` : "Musician not found" };
}

export default async function MusicianPage({ params }: { params: Promise<{ slug: string }> }) {
  const musician = await getMusician((await params).slug);
  if (!musician) notFound();

  const embeds = musician.media_urls.map(toEmbedUrl).filter((u): u is string => !!u);
  const links = Object.entries(musician.links).filter(([, url]) => url);

  return (
    <article className="space-y-6">
      <div className="card overflow-hidden p-0">
        <ProfileHeader musician={musician} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {musician.bio && (
            <section className="card p-6">
              <h2 className="mb-3 text-lg font-bold">About</h2>
              <p className="leading-relaxed whitespace-pre-line text-foreground/90">{musician.bio}</p>
            </section>
          )}
          {embeds.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Headphones className="h-5 w-5" style={{ color: musician.accent_color }} /> Listen
              </h2>
              {embeds.map((src) => (
                <iframe key={src} src={src} className="aspect-video w-full rounded-2xl border border-border bg-card-2"
                  allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              ))}
            </section>
          )}
          {!musician.bio && embeds.length === 0 && (
            <p className="card text-sm text-muted">{musician.stage_name} hasn&apos;t added a bio or tracks yet.</p>
          )}
        </div>

        <aside className="space-y-4">
          {musician.instruments.length > 0 && (
            <section className="card">
              <h2 className="mb-3 text-sm font-semibold text-muted">Instruments</h2>
              <div className="flex flex-wrap gap-1.5">
                {musician.instruments.map((i) => <span key={i} className="chip">{i}</span>)}
              </div>
            </section>
          )}
          {links.length > 0 && (
            <section className="card">
              <h2 className="mb-2 text-sm font-semibold text-muted">Links</h2>
              <ul className="-mx-2">
                {links.map(([name, url]) => (
                  <li key={name}>
                    <a href={url} target="_blank" rel="noopener noreferrer nofollow"
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium capitalize transition hover:bg-card-2">
                      {name} <ExternalLink className="h-4 w-4" style={{ color: musician.accent_color }} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
