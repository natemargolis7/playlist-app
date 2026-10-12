export type Role = "musician" | "venue";
export type GigStatus = "open" | "filled" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";

export type MusicianLinks = Partial<
  Record<"website" | "instagram" | "spotify" | "youtube" | "soundcloud" | "bandcamp", string>
>;

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
}

export interface Musician {
  id: string;
  slug: string;
  stage_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  genres: string[];
  instruments: string[];
  rate_cents: number | null;
  avatar_url: string | null;
  banner_url: string | null;
  accent_color: string;
  links: MusicianLinks;
  media_urls: string[];
  available: boolean;
}

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  capacity: number | null;
  website: string | null;
  logo_url: string | null;
}

export interface Gig {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number | null;
  pay_cents: number;
  genres: string[];
  status: GigStatus;
  created_at: string;
}

export interface Application {
  id: string;
  gig_id: string;
  musician_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
}
