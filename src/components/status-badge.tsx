const STYLES: Record<string, string> = {
  open: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  filled: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  declined: "bg-red-500/10 text-red-700 dark:text-red-300",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
  withdrawn: "bg-card-2 text-muted",
  expired: "bg-card-2 text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STYLES[status] ?? "bg-card-2 text-muted"}`}>
      {status}
    </span>
  );
}
