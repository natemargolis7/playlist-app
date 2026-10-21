import { Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/format";

// Enough answered applications for the numbers to mean something.
const MIN_SAMPLE = 3;

/** How quickly a venue answers applicants. Renders nothing until there's enough history. */
export async function ResponseTime({ venueId, className = "" }: { venueId: string; className?: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("venue_response_stats", { p_venue: venueId }).maybeSingle();
  const stats = data as { answered: number; expired: number; median_hours: number | null } | null;
  if (!stats || stats.answered + stats.expired < MIN_SAMPLE) return null;

  const onTime = Math.round((stats.answered / (stats.answered + stats.expired)) * 100);
  return (
    <p className={`inline-flex items-center gap-1 ${className}`}>
      <Timer className="h-4 w-4" />
      {stats.median_hours != null && `Usually replies in ${formatDuration(stats.median_hours)} · `}
      {`${onTime}% of applicants answered in time`}
    </p>
  );
}
