import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import type { Musician, Venue } from "@/lib/types";
import { MusicianForm } from "./musician-form";
import { VenueForm } from "./venue-form";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireSession();

  if (profile.role === "musician") {
    const { data } = await supabase.from("musicians").select("*").eq("id", user.id).single();
    return (
      <div>
        <PageHeader eyebrow="Profile" title="Make it yours" description="Everything here shows on your public profile. The preview updates as you type." />
        {data ? <MusicianForm musician={data as Musician} /> : <p>Profile not found.</p>}
      </div>
    );
  }

  const { data } = await supabase.from("venues").select("*").eq("id", user.id).single();
  return (
    <div>
      <PageHeader eyebrow="Venue" title="Your venue" description="Musicians see this when they look at your gigs." />
      {data ? <VenueForm venue={data as Venue} /> : <p>Venue not found.</p>}
    </div>
  );
}
