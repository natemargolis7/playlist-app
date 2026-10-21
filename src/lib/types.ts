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
  /** Venues must accept or decline by this time, or the application closes as expired. */
  respond_by: string;
  decided_at: string | null;
  /** Set when the system closed the application rather than the venue declining it. */
  closed_reason: "expired" | "gig_filled" | "gig_cancelled" | null;
}

export interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface ContactDetails {
  user_id: string;
  email: string | null;
  phone: string | null;
  email_notifications: boolean;
}

/** A row from the `inbox()` database function. */
export interface InboxRow {
  application_id: string;
  gig_id: string;
  gig_title: string;
  starts_at: string;
  status: ApplicationStatus;
  other_id: string;
  other_name: string;
  other_avatar: string | null;
  other_color: string | null;
  other_slug: string | null;
  last_body: string | null;
  last_at: string;
  last_sender: string;
  unread: number;
}
