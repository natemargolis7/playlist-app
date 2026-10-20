"use client";

import { useId, useState } from "react";
import { MapPin } from "lucide-react";

/** Single-value text input with a filtered dropdown of suggestions. Any typed value is allowed. */
export function Combobox({
  name,
  id,
  options,
  defaultValue = "",
  placeholder,
  onChange,
}: {
  name: string;
  id?: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const q = value.trim().toLowerCase();
  const matches = options
    .filter((o) => o.toLowerCase().includes(q) && o !== value)
    .sort((a, b) => Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)))
    .slice(0, 8);

  function choose(next: string) {
    setValue(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        id={id}
        name={name}
        role="combobox"
        autoComplete="off"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        className="input pl-10"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open && matches[active]) {
            e.preventDefault();
            choose(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card p-1 shadow-xl">
          {matches.map((m, i) => (
            <li
              key={m}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(m)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${i === active ? "bg-card-2" : ""}`}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
