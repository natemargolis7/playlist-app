export function formatMoney(cents: number | null | undefined) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

/** "rock, Jazz , funk" -> ["rock", "jazz", "funk"] */
export function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function dollarsToCents(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? "").replace(/[$,]/g, ""));
  return Number.isFinite(n) && String(value ?? "").trim() !== "" ? Math.round(n * 100) : null;
}

/** Turn a YouTube/SoundCloud/Spotify link into an embeddable iframe src, or null. */
export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" && u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (host === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (host === "open.spotify.com") return `https://open.spotify.com/embed${u.pathname}`;
    if (host === "soundcloud.com")
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23000000&visual=true`;
    return null;
  } catch {
    return null;
  }
}

export function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

/** Badge label for an application: "expired" once the venue's deadline passes, even before the sweep closes it. */
export function applicationStatus(a: { status: string; respond_by: string; closed_reason: string | null }) {
  if (a.closed_reason === "expired") return "expired";
  if (a.status === "pending" && new Date(a.respond_by).getTime() <= Date.now()) return "expired";
  return a.status;
}

/** 0.4 -> "under an hour", 5 -> "about 5 hours", 50 -> "about 2 days" */
export function formatDuration(hours: number) {
  if (hours < 1) return "under an hour";
  if (hours < 36) return `about ${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"}`;
  return `about ${Math.round(hours / 24)} days`;
}
