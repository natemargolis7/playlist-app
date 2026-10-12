import Link from "next/link";
import { getSession } from "@/lib/session";

export async function Nav() {
  const { profile } = await getSession();

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-5xl items-center gap-5 px-4 py-3 text-sm">
        <Link href="/" className="text-lg font-bold text-brand">
          Playlist
        </Link>
        <Link href="/gigs">Gigs</Link>
        <Link href="/musicians">Musicians</Link>
        <div className="ml-auto flex items-center gap-3">
          {profile ? (
            <>
              {profile.role === "venue" && (
                <Link href="/gigs/new" className="btn">
                  Post a gig
                </Link>
              )}
              <Link href="/dashboard">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button className="text-muted hover:text-foreground">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
