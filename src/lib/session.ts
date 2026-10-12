import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Current user + profile, or null when signed out. */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("id, role, display_name").eq("id", user.id).single();
  return { supabase, user, profile: profile as Profile | null };
}

export async function requireSession() {
  const session = await getSession();
  if (!session.user || !session.profile) redirect("/login");
  return session as typeof session & { user: NonNullable<typeof session.user>; profile: Profile };
}
