import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmailClass } from "@/lib/types";

/** Outline only, in the hue of the system the mail is routed to — the same treatment as a source tag. */
const tone: Record<EmailClass, string> = {
  Invoice: "border-src-ezzybills/45 text-src-ezzybills",
  RFQ: "border-src-costx/45 text-src-costx",
  "Client query": "border-src-approvalmax/45 text-src-approvalmax",
  "Subbie quote": "border-src-m365/45 text-src-m365",
  Noise: "border-border text-muted-foreground",
};

export function ClassBadge({ value, className }: { value: EmailClass; className?: string }) {
  return (
    <Badge variant="outline" className={cn("bg-transparent", tone[value], className)}>
      {value}
    </Badge>
  );
}

/**
 * Model confidence as the ledger's square-ended 3px meter: ink when it clears
 * the 90% bar, amber below it so a person looks twice. Never green — green
 * means approved, and a confident guess is not an approval.
 */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("relative h-[3px] bg-foreground/10", className)} aria-hidden="true">
      <div
        className={cn("absolute inset-y-0 left-0", value >= 0.9 ? "bg-foreground/60" : "bg-warn")}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
