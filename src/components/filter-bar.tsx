import Link from "next/link";
import { Search, X } from "lucide-react";

export function FilterBar({
  fields,
  values,
  basePath,
}: {
  fields: { name: string; placeholder: string; icon?: boolean; inputMode?: "decimal" }[];
  values: Record<string, string | undefined>;
  basePath: string;
}) {
  const active = Object.values(values).some(Boolean);
  return (
    <form className="mb-8 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-xs sm:flex-row">
      {fields.map((f, i) => (
        <div key={f.name} className="relative flex-1">
          {i === 0 && <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />}
          <input
            name={f.name}
            placeholder={f.placeholder}
            inputMode={f.inputMode}
            defaultValue={values[f.name]}
            className={`input border-transparent shadow-none ${i === 0 ? "pl-10" : ""}`}
          />
        </div>
      ))}
      <div className="flex gap-2">
        {active && (
          <Link href={basePath} className="btn-ghost" aria-label="Clear filters">
            <X className="h-4 w-4" />
          </Link>
        )}
        <button className="btn flex-1 sm:flex-none">Search</button>
      </div>
    </form>
  );
}
