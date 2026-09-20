import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceFlag, InvoiceStatus, ProjectStatus } from "@/lib/types";

/**
 * Status colours are fixed product-wide:
 * red = over budget / exception, amber = approaching or pending, green = healthy or approved.
 */

const projectTone: Record<ProjectStatus, "ok" | "warn" | "over"> = {
  "On track": "ok",
  "At risk": "warn",
  "Over budget": "over",
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <Badge variant={projectTone[status]} className={cn("whitespace-nowrap", className)}>
      {status}
    </Badge>
  );
}

const invoiceTone: Record<InvoiceStatus, "secondary" | "warn" | "ok" | "default"> = {
  Captured: "secondary",
  Coded: "secondary",
  "Pending approval": "warn",
  Approved: "ok",
  "Awaiting payment": "default",
  Paid: "ok",
};

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <Badge variant={invoiceTone[status]} className={cn("whitespace-nowrap", className)}>
      {status}
    </Badge>
  );
}

export function FlagBadge({ flag, className }: { flag: InvoiceFlag; className?: string }) {
  return (
    <Badge variant="over" className={cn("whitespace-nowrap", className)}>
      {flag}
    </Badge>
  );
}
