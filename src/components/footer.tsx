import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <div className="flex gap-5">
          <Link href="/gigs" className="hover:text-foreground">Find gigs</Link>
          <Link href="/musicians" className="hover:text-foreground">Musicians</Link>
          <Link href="/signup?role=venue" className="hover:text-foreground">For venues</Link>
        </div>
        <p>© {new Date().getFullYear()} Playlist</p>
      </div>
    </footer>
  );
}
