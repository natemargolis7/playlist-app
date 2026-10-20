import { AlertCircle, CheckCircle2 } from "lucide-react";

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error)
    return (
      <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
      </p>
    );
  if (message)
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}
      </p>
    );
  return null;
}
