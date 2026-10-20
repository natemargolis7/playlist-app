"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";

/**
 * Searchable multi-select with chips. Picks from `options` but also lets people add
 * their own value. Submits a comma-separated list through a hidden input named `name`.
 */
export function MultiSelect({
  name,
  options,
  defaultValue = [],
  placeholder = "Search or add…",
  max,
  onChange,
}: {
  name: string;
  options: string[];
  defaultValue?: string[];
  placeholder?: string;
  max?: number;
  onChange?: (values: string[]) => void;
}) {
  const [values, setValues] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => options.filter((o) => o.includes(q)).sort((a, b) => Number(b.startsWith(q)) - Number(a.startsWith(q))),
    [options, q],
  );
  const canAdd = q !== "" && !options.includes(q) && !values.includes(q);
  const items = canAdd ? [...matches, q] : matches;
  const full = max != null && values.length >= max;

  function set(next: string[]) {
    setValues(next);
    onChange?.(next);
  }

  function toggle(value: string) {
    if (values.includes(value)) set(values.filter((v) => v !== value));
    else if (!full) set([...values, value]);
    setQuery("");
    setActive(0);
    // Close after each pick so the list doesn't cover the rest of the form.
    setOpen(false);
  }

  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <input type="hidden" name={name} value={values.join(", ")} />
      <div
        className="input flex min-h-11 cursor-text flex-wrap items-center gap-1.5 py-1.5"
        onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}
      >
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-0.5 pr-1 pl-2.5 text-xs font-medium text-brand">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => toggle(v)} className="rounded-full p-0.5 hover:bg-brand/15">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          value={query}
          placeholder={values.length ? "" : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if ((e.key === "Enter" || e.key === ",") && (open || q)) {
              e.preventDefault();
              if (items[active]) toggle(items[active]);
            } else if (e.key === "Backspace" && !query && values.length) {
              set(values.slice(0, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="min-w-24 flex-1 bg-transparent py-1 outline-none placeholder:text-muted/70"
        />
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable
          className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card p-1 shadow-xl"
        >
          {items.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
          {items.map((item, i) => {
            const selected = values.includes(item);
            const custom = canAdd && i === items.length - 1;
            return (
              <li
                key={item}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => toggle(item)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm capitalize ${
                  i === active ? "bg-card-2" : ""
                } ${!selected && full ? "opacity-40" : ""}`}
              >
                <span className="inline-flex items-center gap-2">
                  {custom && <Plus className="h-3.5 w-3.5 text-brand" />}
                  {custom ? <>Add &ldquo;{item}&rdquo;</> : item}
                </span>
                {selected && <Check className="h-4 w-4 text-brand" />}
              </li>
            );
          })}
        </ul>
      )}
      {max != null && <p className="mt-1.5 text-xs text-muted">{values.length}/{max} selected</p>}
    </div>
  );
}
