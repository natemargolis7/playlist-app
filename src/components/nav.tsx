import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, MessagesSquare, Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export async function Nav() {
  const { supabase, profile } = await getSession();
  let unread = 0;
  if (profile) {
    const { data } = await supabase.rpc("inbox");
    unread = ((data ?? []) as { unread: number }[]).reduce((n, r) => n + r.unread, 0);
  }

  const account = profile ? (
    <>
      {profile.role === "venue" && (
        <Link href="/gigs/new" className="btn">
          <Plus className="h-4 w-4" /> Post a gig
        </Link>
      )}
      <Link href="/messages" className="btn-ghost relative">
        <MessagesSquare className="h-4 w-4" /> Messages
        {unread > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-ink">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
      <Link href="/dashboard" className="btn-ghost">
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </Link>
      <form action="/auth/signout" method="post">
        <button className="btn-ghost w-full justify-start">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" className="btn-ghost">Log in</Link>
      <Link href="/signup" className="btn">Sign up</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-background">
      <nav className="flex h-16 items-center gap-6 px-4 sm:px-6">
        <Logo />
        <NavLinks className="hidden items-center gap-1 md:flex" />
        <div className="ml-auto hidden items-center gap-1 md:flex">{account}</div>

        <details className="group relative ml-auto md:hidden">
          <summary className="btn-ghost cursor-pointer list-none [&::-webkit-details-marker]:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 mt-2 flex w-60 flex-col gap-1 rounded-2xl bg-card p-2 shadow-xl">
            <NavLinks className="flex flex-col" />
            <div className="my-1 h-1.5 bg-card-2" />
            <div className="flex flex-col gap-1 [&>.btn]:mt-1">{account}</div>
          </div>
        </details>
      </nav>
    </header>
  );
}
