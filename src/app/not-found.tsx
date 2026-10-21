import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <h1 className="text-5xl leading-none">This stage is empty</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or was removed.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/gigs" className="btn">Browse gigs</Link>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
