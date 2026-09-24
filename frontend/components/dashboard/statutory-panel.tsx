import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockBadge } from "@/components/statutory-clock";
import { getOpenClocks, getProjectName, getRetentionPosition } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The statutory position, on the opening screen.
 *
 * Budget overruns cost margin; these cost the right to be paid. They belong
 * where someone sees them first, not three clicks in.
 */
export function StatutoryPanel() {
  const clocks = getOpenClocks().slice(0, 3);
  const retention = getRetentionPosition();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm">Statutory deadlines</CardTitle>
        <Link
          href="/variations"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {clocks.map((c) => (
          <Link
            key={c.id}
            href={c.kind === "Variation notice due" ? "/variations" : c.kind === "Payment due" ? "/claims" : "/approvals"}
            className={cn(
              "block rounded-md border p-3 transition-colors hover:bg-accent/50",
              c.overdue && c.exposure === "Ours" ? "border-over-border" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-snug">{c.sourceLabel}</span>
              <ClockBadge clock={c} className="shrink-0" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {c.kind} · {getProjectName(c.projectId)}
            </p>
          </Link>
        ))}

        <Link
          href="/retentions"
          className={cn(
            "flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50",
            retention.compliant ? "border-border" : "border-over-border"
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              retention.compliant ? "bg-muted text-muted-foreground" : "bg-over-soft text-over"
            )}
          >
            <Landmark className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Retention held on trust</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {retention.compliant
                ? `${formatCurrency(retention.liability)} fully backed by the trust account`
                : `${formatCurrency(retention.shortfall)} short of the ledger — an offence under the 2023 amendment`}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
