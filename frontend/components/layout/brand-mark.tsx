import { cn } from "@/lib/utils";

/**
 * The BuildLedger mark: a block of ink cut by two ruled lines — a page of the
 * ledger, and the line where two systems' figures meet.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("h-5 w-5 shrink-0", className)}>
      <rect width="20" height="20" rx="1.5" className="fill-foreground" />
      <rect x="4" y="7" width="12" height="1.5" className="fill-background" />
      <rect x="4" y="11.5" width="7" height="1.5" className="fill-background" />
      <rect x="12.5" y="11.5" width="3.5" height="1.5" className="fill-background" />
    </svg>
  );
}
