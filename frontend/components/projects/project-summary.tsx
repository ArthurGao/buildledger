import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SourceBadge } from "@/components/source-badge";
import { formatCurrency, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Project, System } from "@/lib/types";

function Figure({
  label,
  value,
  source,
  tone,
  hint,
}: {
  label: string;
  value: string;
  source?: System;
  tone?: "over" | "ok";
  hint?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {source ? <SourceBadge system={source} short /> : null}
      </div>
      <p
        className={cn(
          "tabular mt-1.5 text-xl font-semibold tracking-tight",
          tone === "over" && "text-over",
          tone === "ok" && "text-ok"
        )}
      >
        {value}
      </p>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function ProjectSummary({ project }: { project: Project }) {
  const overrun = project.forecastFinal - project.budgetTotal;
  const overrunPct = (overrun / project.budgetTotal) * 100;
  const marginDelta = project.forecastMarginPct - project.budgetMarginPct;
  const MarginIcon = marginDelta < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="grid divide-y divide-border rounded-lg border border-border bg-card shadow-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 [&>*]:border-border sm:[&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+2)]:border-l lg:[&>*:nth-child(n+3)]:border-t-0">
      <Figure label="Budget" value={formatCurrency(project.budgetTotal)} source="CostX" hint="at tender" />
      <Figure
        label="Committed"
        value={formatCurrency(project.committedTotal)}
        source="ApprovalMax"
        hint="purchase orders raised"
      />
      <Figure label="Actual to date" value={formatCurrency(project.actualTotal)} source="Xero" hint="costs incurred" />
      <Figure
        label="Forecast final"
        value={formatCurrency(project.forecastFinal)}
        tone={overrun > 0 ? "over" : undefined}
        hint={
          <span className={cn("tabular font-medium", overrun > 0 ? "text-over" : "text-ok")}>
            {overrun > 0 ? "+" : ""}
            {formatCurrency(Math.abs(overrun))} ({overrunPct > 0 ? "+" : ""}
            {overrunPct.toFixed(1)}%) vs budget
          </span>
        }
      />
      <Figure
        label="Margin"
        value={formatPct(project.forecastMarginPct)}
        tone={marginDelta < 0 ? "over" : "ok"}
        hint={
          <span className="inline-flex items-center gap-1">
            <MarginIcon className={cn("h-3 w-3", marginDelta < 0 ? "text-over" : "text-ok")} />
            {marginDelta > 0 ? "+" : ""}
            {marginDelta.toFixed(1)} pts from {formatPct(project.budgetMarginPct)}
          </span>
        }
      />
    </div>
  );
}
