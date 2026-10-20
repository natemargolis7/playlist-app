import Link from "next/link";
import { AudioLines } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fill to-fill-2 text-white">
        <AudioLines className="h-4.5 w-4.5" />
      </span>
      Playlist
    </Link>
  );
}
