import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmailClass } from "@/lib/types";

const tone: Record<EmailClass, string> = {
  Invoice: "border-src-ezzybills/25 bg-src-ezzybills-soft text-src-ezzybills",
  RFQ: "border-src-costx/25 bg-src-costx-soft text-src-costx",
  "Client query": "border-src-approvalmax/25 bg-src-approvalmax-soft text-src-approvalmax",
  "Subbie quote": "border-src-m365/25 bg-src-m365-soft text-src-m365",
  Noise: "border-border bg-muted text-muted-foreground",
};

export function ClassBadge({ value, className }: { value: EmailClass; className?: string }) {
  return (
    <Badge variant="outline" className={cn(tone[value], className)}>
      {value}
    </Badge>
  );
}

export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full", value >= 0.9 ? "bg-ok" : "bg-warn")}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
