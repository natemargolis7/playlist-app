"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { dollarsToCents, parseList } from "@/lib/format";
import type { MusicianLinks } from "@/lib/types";

export type FormState = { error?: string; message?: string };

const LINK_KEYS = ["website", "instagram", "spotify", "youtube", "soundcloud", "bandcamp"] as const;

function optional(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export async function updateMusician(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user, profile } = await requireSession();
  if (profile.role !== "musician") return { error: "Only musicians have a musician profile." };

  const links: MusicianLinks = {};
  for (const key of LINK_KEYS) {
    const v = optional(formData, `link_${key}`);
    if (v && !isHttpUrl(v)) return { error: `${key} link must start with http:// or https://` };
    if (v) links[key] = v;
  }

  const mediaUrls = String(formData.get("media_urls") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (mediaUrls.some((u) => !isHttpUrl(u))) return { error: "Media links must be full URLs." };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(slug))
    return { error: "Profile URL must be 3-40 characters: lowercase letters, numbers and dashes." };

  const accent = String(formData.get("accent_color") ?? "#e0662b");
  const avatarUrl = optional(formData, "avatar_url");
  const bannerUrl = optional(formData, "banner_url");
  if ((avatarUrl && !isHttpUrl(avatarUrl)) || (bannerUrl && !isHttpUrl(bannerUrl)))
    return { error: "Image links must be full URLs." };

  const { error } = await supabase
    .from("musicians")
    .update({
      slug,
      stage_name: String(formData.get("stage_name") ?? "").trim() || profile.display_name,
      headline: optional(formData, "headline"),
      bio: optional(formData, "bio"),
      location: optional(formData, "location"),
      genres: parseList(formData.get("genres")),
      instruments: parseList(formData.get("instruments")),
      rate_cents: dollarsToCents(formData.get("rate")),
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
      accent_color: /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "#e0662b",
      links,
      media_urls: mediaUrls,
      available: formData.get("available") === "on",
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "That profile URL is taken. Try another." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath(`/musicians/${slug}`);
  return { message: "Profile saved." };
}

export async function updateVenue(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user, profile } = await requireSession();
  if (profile.role !== "venue") return { error: "Only venues have a venue profile." };

  const capacity = Number(formData.get("capacity"));
  const website = optional(formData, "website");
  const logoUrl = optional(formData, "logo_url");
  if ((website && !isHttpUrl(website)) || (logoUrl && !isHttpUrl(logoUrl)))
    return { error: "Links must be full URLs." };

  const { error } = await supabase
    .from("venues")
    .update({
      name: String(formData.get("name") ?? "").trim() || profile.display_name,
      description: optional(formData, "description"),
      address: optional(formData, "address"),
      city: optional(formData, "city"),
      capacity: Number.isInteger(capacity) && capacity > 0 ? capacity : null,
      website,
      logo_url: logoUrl,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath(`/venues/${user.id}`);
  return { message: "Venue saved." };
}
