/** Black-and-amber stage-edge tape, built from filled blocks. */
export function TapeStripe({ className = "h-10" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex overflow-hidden bg-accent ${className}`}>
      {Array.from({ length: 36 }, (_, i) => (
        <span key={i} className="mr-7 w-7 shrink-0 -skew-x-[35deg] bg-floor" />
      ))}
    </div>
  );
}
