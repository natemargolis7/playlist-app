import { requireSession } from "@/lib/session";
import type { Musician, Venue } from "@/lib/types";
import { MusicianForm } from "./musician-form";
import { VenueForm } from "./venue-form";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireSession();

  if (profile.role === "musician") {
    const { data } = await supabase.from("musicians").select("*").eq("id", user.id).single();
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Your musician profile</h1>
        {data ? <MusicianForm musician={data as Musician} /> : <p>Profile not found.</p>}
      </div>
    );
  }

  const { data } = await supabase.from("venues").select("*").eq("id", user.id).single();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your venue</h1>
      {data ? <VenueForm venue={data as Venue} /> : <p>Venue not found.</p>}
    </div>
  );
}
