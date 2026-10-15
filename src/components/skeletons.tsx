export function ListSkeleton({ count = 6, cols = "md:grid-cols-2", height = "h-28" }: { count?: number; cols?: string; height?: string }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-9 w-56" />
        <div className="skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="skeleton mb-8 h-14" />
      <div className={`grid gap-4 ${cols}`}>
        {Array.from({ length: count }, (_, i) => <div key={i} className={`skeleton ${height}`} />)}
      </div>
    </div>
  );
}
