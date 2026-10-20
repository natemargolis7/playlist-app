import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import type { ContactDetails, Musician, Venue } from "@/lib/types";
import { ContactForm } from "./contact-form";
import { MusicianForm } from "./musician-form";
import { VenueForm } from "./venue-form";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireSession();
  const { data: contact } = await supabase.from("contact_details").select("*").eq("user_id", user.id).maybeSingle();

  if (profile.role === "musician") {
    const { data } = await supabase.from("musicians").select("*").eq("id", user.id).single();
    return (
      <div>
        <PageHeader eyebrow="Profile" title="Make it yours" description="Everything here shows on your public profile. The preview updates as you type." />
        {data ? <MusicianForm musician={data as Musician} /> : <p>Profile not found.</p>}
        <ContactForm contact={contact as ContactDetails | null} />
      </div>
    );
  }

  const { data } = await supabase.from("venues").select("*").eq("id", user.id).single();
  return (
    <div>
      <PageHeader eyebrow="Venue" title="Your venue" description="Musicians see this when they look at your gigs." />
      {data ? <VenueForm venue={data as Venue} /> : <p>Venue not found.</p>}
      <ContactForm contact={contact as ContactDetails | null} />
    </div>
  );
}
