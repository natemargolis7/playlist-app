export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>;
  if (message) return <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700">{message}</p>;
  return null;
}
