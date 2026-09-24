import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExceptionIcon } from "@/components/exception-icon";
import { SourceBadge } from "@/components/source-badge";
import { getProjectName } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExceptionItem, System } from "@/lib/types";

/** Which system caught it — the credibility of the exception rests on this. */
const detectedBy: Record<ExceptionItem["type"], System[]> = {
  "Duplicate invoice": ["EzzyBills", "Xero"],
  "No PO spend": ["Xero", "ApprovalMax"],
  "Over budget": ["CostX", "Xero"],
  // The statutory exceptions come from a clock running against a received
  // document — contract terms from CostX, the document from the AP stack.
  "Payment schedule overdue": ["EzzyBills", "ApprovalMax"],
  "Variation notice overdue": ["M365", "CostX"],
  "Retention shortfall": ["Xero"],
};

export function ExceptionCard({ exception }: { exception: ExceptionItem }) {
  const high = exception.severity === "High";

  return (
    <Card className={cn(high && "border-over-border")}>
      <CardContent className="flex flex-wrap items-start gap-4 p-5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            high ? "bg-over-soft text-over" : "bg-warn-soft text-warn"
          )}
        >
          <ExceptionIcon type={exception.type} className="h-5 w-5" />
        </span>

        <div className="min-w-[240px] flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{exception.type}</h3>
            <Badge variant={high ? "over" : "warn"}>{exception.severity}</Badge>
            <Badge variant="outline" className="font-mono text-[11px]">
              {exception.projectId}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{exception.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-xs text-muted-foreground">Detected from</span>
            {detectedBy[exception.type].map((s) => (
              <SourceBadge key={s} system={s} short />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {exception.amount ? (
            <span className={cn("tabular text-lg font-semibold", high ? "text-over" : "text-foreground")}>
              {formatCurrency(exception.amount)}
            </span>
          ) : null}
          <Link
            href={exception.relatedInvoiceId ? "/invoices" : `/projects/${exception.projectId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {exception.relatedInvoiceId ? "View invoice" : "View project"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-xs text-muted-foreground">{getProjectName(exception.projectId)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
