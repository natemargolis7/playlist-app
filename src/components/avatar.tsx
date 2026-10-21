/* eslint-disable @next/next/no-img-element -- user-supplied image URLs from any host */
export function Avatar({
  name,
  url,
  color,
  className = "h-12 w-12 text-lg",
}: {
  name: string;
  url: string | null;
  color: string;
  className?: string;
}) {
  if (url) return <img src={url} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${className}`}
      style={{ background: color }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
