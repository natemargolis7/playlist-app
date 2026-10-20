import Link from "next/link";
import { Music2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Music2 className="h-7 w-7" />
      </span>
      <p className="eyebrow mb-2">404</p>
      <h1 className="text-3xl font-bold">This stage is empty</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or was removed.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/gigs" className="btn">Browse gigs</Link>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
