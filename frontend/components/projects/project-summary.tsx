import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SourceBadge } from "@/components/source-badge";
import { getVariations } from "@/lib/derive";
import { formatCurrency, formatPct, formatSignedCurrency, formatSignedPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

/** The forecast overrun, set at the size of the question it answers. */
export function ForecastHeadline({ project }: { project: Project }) {
  const overrun = project.forecastFinal - project.budgetTotal;
  const pct = (overrun / project.budgetTotal) * 100;
  const over = overrun > 0;

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
      <p
        className={cn(
          "tabular text-[34px] font-semibold leading-none tracking-[-0.02em] sm:text-[42px]",
          over ? "text-over" : "text-foreground"
        )}
      >
        {formatSignedCurrency(overrun)}
      </p>
      <p className="pb-1 text-[13px] leading-snug text-muted-foreground">
        <span className={cn("tabular font-semibold", over ? "text-over" : "text-foreground")}>
          {formatSignedPct(pct)}
        </span>{" "}
        {over ? "over" : "under"} budget at completion
        <br className="hidden sm:block" />
        <span className="sm:hidden"> · </span>
        forecast <span className="tabular font-medium text-foreground">{formatCurrency(project.forecastFinal)}</span>{" "}
        against <span className="tabular font-medium text-foreground">{formatCurrency(project.budgetTotal)}</span>
      </p>
      {/* The forecast is the PM's own figure, so it is credited to the systems it is built from. */}
      <p className="flex w-full flex-wrap items-center gap-1 text-[11.5px] text-muted-foreground">
        Project manager&rsquo;s forecast, built from
        <SourceBadge system="CostX" short />
        <SourceBadge system="ApprovalMax" short />
        <SourceBadge system="Xero" short />
      </p>
    </div>
  );
}

/** Committed, actual, margin and open variations — the figures beside the bridge. */
export function ProjectFigures({ project }: { project: Project }) {
  const committedPct = (project.committedTotal / project.budgetTotal) * 100;
  // Variations that change the cost but are not yet in the CostX budget.
  const open = getVariations(project.id).filter((v) => !v.writtenBackToBudget && v.status !== "Rejected");
  const openValue = open.reduce((sum, v) => sum + (v.costImpact ?? 0), 0);
  const unpriced = open.filter((v) => v.costImpact === null).length;
  const spentPct = (project.actualTotal / project.forecastFinal) * 100;
  const marginDelta = project.forecastMarginPct - project.budgetMarginPct;

  return (
    <div className="grid h-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-4 [&>*+*]:border-t [&>*]:border-border sm:[&>*:nth-child(2)]:border-t-0 sm:[&>*:nth-child(even)]:border-l lg:[&>*:nth-child(2)]:border-t lg:[&>*:nth-child(even)]:border-l-0">
      <RuledFigure
        label="Committed"
        value={formatCurrency(project.committedTotal)}
        source="ApprovalMax"
        note={`${Math.round(committedPct)}% of budget on purchase orders`}
      />
      <RuledFigure
        label="Actual to date"
        value={formatCurrency(project.actualTotal)}
        source="Xero"
        note={`${Math.round(spentPct)}% of the forecast spent`}
      />
      <RuledFigure
        label="Margin at completion"
        value={formatPct(project.forecastMarginPct)}
        source={["CostX", "Xero"]}
        tone={marginDelta < 0 ? "over" : undefined}
        note={
          <>
            <span className={cn("tabular font-medium", marginDelta < 0 ? "text-over" : "text-foreground")}>
              {marginDelta > 0 ? "+" : marginDelta < 0 ? "-" : ""}
              {Math.abs(marginDelta).toFixed(1)} pts
            </span>{" "}
            from {formatPct(project.budgetMarginPct)} at tender
          </>
        }
      />
      <RuledFigure
        label="Variations not in budget"
        value={formatCurrency(openValue)}
        note={
          open.length === 0
            ? "None open"
            : `${open.length} open${unpriced ? ` · ${unpriced} not yet priced` : ""}`
        }
      />
    </div>
  );
}
