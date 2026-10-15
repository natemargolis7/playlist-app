"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <TriangleAlert className="h-7 w-7" />
      </span>
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">
        We couldn&apos;t load this page. If it keeps happening, check that the app is connected to Supabase.
      </p>
      <button onClick={reset} className="btn mt-8">
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
