"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/gigs", label: "Find gigs" },
  { href: "/musicians", label: "Musicians" },
];

export function NavLinks({ className = "", itemClassName = "" }: { className?: string; itemClassName?: string }) {
  const pathname = usePathname();
  return (
    <div className={className}>
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "text-foreground underline decoration-accent decoration-[3px] underline-offset-[10px]" : "text-muted hover:text-foreground"
            } ${itemClassName}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
