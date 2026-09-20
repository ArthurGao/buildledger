import { cn } from "@/lib/utils";

/**
 * A mini bar that reads from a shared centre line: over budget pushes right
 * in red, under budget pushes left in green. Scaled against the worst
 * variance on the page so the bars are comparable row to row.
 */
export function VarianceBar({
  value,
  max,
  className,
}: {
  value: number;
  /** Largest absolute variance in the same table. */
  max: number;
  className?: string;
}) {
  const ratio = max === 0 ? 0 : Math.min(1, Math.abs(value) / max);
  const width = `${(ratio * 50).toFixed(1)}%`;
  const over = value > 0;

  return (
    <div className={cn("relative h-1.5 w-full rounded-full bg-muted", className)}>
      <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-border" />
      {value !== 0 ? (
        <span
          className={cn(
            "absolute top-0 h-1.5 rounded-full",
            over ? "left-1/2 bg-over" : "right-1/2 bg-ok"
          )}
          style={{ width }}
        />
      ) : null}
    </div>
  );
}
