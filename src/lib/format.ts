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
