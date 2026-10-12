import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile-header";
import { toEmbedUrl } from "@/lib/format";
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
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ProfileHeader musician={musician} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-6">
          {musician.bio && (
            <section className="card">
              <h2 className="mb-2 font-semibold">About</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed">{musician.bio}</p>
            </section>
          )}
          {embeds.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold">Listen</h2>
              {embeds.map((src) => (
                <iframe key={src} src={src} className="aspect-video w-full rounded-xl border border-border"
                  allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              ))}
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {musician.instruments.length > 0 && (
            <section className="card">
              <h2 className="mb-2 text-sm font-semibold">Instruments</h2>
              <div className="flex flex-wrap gap-1.5">
                {musician.instruments.map((i) => <span key={i} className="chip">{i}</span>)}
              </div>
            </section>
          )}
          {links.length > 0 && (
            <section className="card">
              <h2 className="mb-2 text-sm font-semibold">Links</h2>
              <ul className="space-y-1 text-sm">
                {links.map(([name, url]) => (
                  <li key={name}>
                    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="capitalize"
                      style={{ color: musician.accent_color }}>
                      {name} ↗
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
