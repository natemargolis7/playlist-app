"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { dollarsToCents, parseList } from "@/lib/format";

export type FormState = { error?: string; message?: string };

export async function createGig(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user, profile } = await requireSession();
  if (profile.role !== "venue") return { error: "Only venues can post gigs." };

  const title = String(formData.get("title") ?? "").trim();
  // datetime-local has no zone; the client sends the browser's UTC offset in minutes.
  const local = String(formData.get("starts_at") ?? "");
  const offset = Number(formData.get("tz_offset") ?? 0);
  const startsAt = new Date(`${local}:00Z`);
  startsAt.setUTCMinutes(startsAt.getUTCMinutes() + (Number.isFinite(offset) ? offset : 0));
  const pay = dollarsToCents(formData.get("pay"));
  const duration = Number(formData.get("duration_minutes"));

  if (!title) return { error: "Title is required." };
  if (Number.isNaN(startsAt.getTime())) return { error: "Pick a date and time." };
  if (startsAt.getTime() < Date.now()) return { error: "The gig must be in the future." };
  if (pay == null || pay < 0) return { error: "Enter the pay for this gig." };

  const { data, error } = await supabase
    .from("gigs")
    .insert({
      venue_id: user.id,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      starts_at: startsAt.toISOString(),
      duration_minutes: Number.isInteger(duration) && duration > 0 ? duration : null,
      pay_cents: pay,
      genres: parseList(formData.get("genres")),
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/gigs");
  redirect(`/gigs/${data.id}`);
}

export async function applyToGig(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user, profile } = await requireSession();
  if (profile.role !== "musician") return { error: "Only musicians can apply." };

  const gigId = String(formData.get("gig_id"));
  const { error } = await supabase.from("applications").insert({
    gig_id: gigId,
    musician_id: user.id,
    message: String(formData.get("message") ?? "").trim() || null,
  });
  if (error) {
    if (error.code === "23505") return { error: "You already applied to this gig." };
    return { error: error.message };
  }

  revalidatePath(`/gigs/${gigId}`);
  return { message: "Application sent!" };
}

export async function setApplicationStatus(formData: FormData) {
  const { supabase } = await requireSession();
  const id = String(formData.get("application_id"));
  const gigId = String(formData.get("gig_id"));
  const status = String(formData.get("status"));
  if (!["accepted", "declined", "withdrawn"].includes(status)) return;

  // RLS + the applications_guard trigger decide who may set which status.
  await supabase.from("applications").update({ status }).eq("id", id);
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/dashboard");
  revalidatePath("/messages", "layout");
}

export async function setGigStatus(formData: FormData) {
  const { supabase } = await requireSession();
  const gigId = String(formData.get("gig_id"));
  const status = String(formData.get("status"));
  if (!["open", "filled", "cancelled"].includes(status)) return;

  await supabase.from("gigs").update({ status }).eq("id", gigId);
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/gigs");
  revalidatePath("/dashboard");
}
