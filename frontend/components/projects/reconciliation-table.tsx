"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { SourceBadge } from "@/components/source-badge";
import { LineRecords } from "@/components/projects/line-records";
import { getLineRecords, getLineTotals, getProjectLines, getUnwrittenVariations } from "@/lib/derive";
import { formatCurrency, formatSignedCurrency, formatSignedPct } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "code" | "forecast" | "variance";

/** Column visibility: the phone view keeps the trade, its forecast variance and the drill-down. */
const wide = "hidden md:table-cell";

/** Columns in the table, for full-width rows (records panel, empty state). Must match the colgroup. */
const COLUMN_COUNT = 10;

/** One column of the sheet's 12-column grid; the table is fixed-layout from xl. */
const col1 = "xl:w-[8.3333%]";
/** A source-tagged header: label beside its tag, stacked label over tag once all columns are showing. */
const taggedHead = "inline-flex items-center gap-1.5 lg:flex-col lg:items-end lg:gap-0.5";

/**
 * The centrepiece of the demo: CostX budget, ApprovalMax commitments and Xero
 * actuals, line by line, measured against the forecast at completion. Only an
 * overrun is red; a line that is under budget because it is not yet invoiced
 * stays quiet. Any line opens to show the records it is summed from.
 */
export function ReconciliationTable({
  projectId,
  open,
  onToggle,
  highlighted,
}: {
  projectId: string;
  open: ReadonlySet<string>;
  onToggle: (code: string) => void;
  /** A code just chosen elsewhere on the page, flashed once. */
  highlighted: string | null;
}) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "code", desc: false });
  const [overOnly, setOverOnly] = useState(false);

  const allLines = getProjectLines(projectId);
  const totals = getLineTotals(projectId);
  const unwritten = new Map(getUnwrittenVariations(projectId).map((v) => [v.costCode, v]));
  const overCount = allLines.filter((l) => l.isForecastOver).length;

  const lines = useMemo(() => {
    const rows = overOnly ? allLines.filter((l) => l.isForecastOver || open.has(l.code)) : [...allLines];
    const dir = sort.desc ? -1 : 1;
    rows.sort((a, b) => {
      if (sort.key === "code") return a.code.localeCompare(b.code) * dir;
      if (sort.key === "forecast") return (a.forecastAmount - b.forecastAmount) * dir;
      return (a.forecastVariance - b.forecastVariance) * dir;
    });
    return rows;
  }, [allLines, overOnly, open, sort]);

  const totalVariance = totals.forecast - totals.budget;

  const sortBy = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== "code" }));

  function SortHeader({ k, children, align = "right" }: { k: SortKey; children: React.ReactNode; align?: "left" | "right" }) {
    const active = sort.key === k;
    const Icon = sort.desc ? ArrowDown : ArrowUp;
    return (
      <button
        type="button"
        onClick={() => sortBy(k)}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active && "text-foreground"
        )}
      >
        {children}
        <Icon className={cn("h-3 w-3", active ? "opacity-100" : "opacity-0")} aria-hidden="true" />
      </button>
    );
  }

  const ariaSort = (k: SortKey) => (sort.key === k ? (sort.desc ? "descending" : "ascending") : "none");

  return (
    <section aria-labelledby="cost-codes-title">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-foreground px-4 pb-3 pt-4 md:px-5">
        <div className="min-w-0">
          <h2 id="cost-codes-title" className="text-[15px] font-semibold tracking-[-0.01em]">
            Cost codes
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Joined on trade code. Variance is forecast at completion against budget. Open a line to see the purchase
            orders and bills behind it.
          </p>
        </div>
        <div role="group" aria-label="Filter cost codes" className="flex shrink-0 rounded-sm border border-foreground/25 p-0.5 text-[12px]">
          {[
            { value: false, label: `All ${allLines.length}` },
            { value: true, label: `Over forecast ${overCount}` },
          ].map((o) => (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={overOnly === o.value}
              onClick={() => setOverOnly(o.value)}
              className={cn(
                "tabular rounded-[2px] px-2.5 py-1 font-medium transition-colors duration-150",
                overOnly === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <table className="w-full text-[13px] xl:table-fixed">
          {/* From xl every column edge is a line of the sheet's 12-column grid —
              the same lines as the bridge above and the split below:
              code and trade 1-4 · budget 5 · committed 6 · actual 7 · spent 8 |
              forecast 9-10 · variance 11 · % 12. The 8 line divides spend to
              date from the position at completion, as it divides the bridge
              from the figures above. */}
          <colgroup>
            <col className="xl:w-9" />
            <col className="xl:w-[4.5rem]" />
            <col />
            <col className={col1} />
            <col className={col1} />
            <col className={col1} />
            <col className={col1} />
            <col className="xl:w-[16.6667%]" />
            <col className={col1} />
            <col className={col1} />
          </colgroup>
          <thead>
            <tr className="border-b border-border align-bottom text-[11.5px] font-medium text-muted-foreground">
              <th scope="col" className="w-9 pl-3" aria-label="Open line" />
              <th scope="col" aria-sort={ariaSort("code")} className="w-[4.5rem] py-2 pr-3 text-left font-medium">
                <SortHeader k="code" align="left">
                  Code
                </SortHeader>
              </th>
              <th scope="col" className="py-2 pr-3 text-left font-medium">
                Trade
              </th>
              <th scope="col" className={cn(wide, "py-2 pr-3 text-right font-medium")}>
                <span className={taggedHead}>
                  Budget <SourceBadge system="CostX" short />
                </span>
              </th>
              <th scope="col" className={cn(wide, "py-2 pr-3 text-right font-medium")}>
                <span className={taggedHead}>
                  Committed <SourceBadge system="ApprovalMax" short />
                </span>
              </th>
              <th scope="col" className={cn(wide, "py-2 pr-3 text-right font-medium")}>
                <span className={taggedHead}>
                  Actual <SourceBadge system="Xero" short />
                </span>
              </th>
              <th scope="col" className="hidden w-28 py-2 pr-3 text-left font-medium lg:table-cell xl:pr-5 xl:text-right">
                Spent of forecast
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("forecast")}
                className="hidden py-2 pr-3 text-right font-medium sm:table-cell"
                title="Forecast cost at completion, set by the project manager"
              >
                <SortHeader k="forecast">Forecast</SortHeader>
              </th>
              <th scope="col" aria-sort={ariaSort("variance")} className="py-2 pr-3 text-right font-medium">
                <SortHeader k="variance">Variance</SortHeader>
              </th>
              <th scope="col" className={cn(wide, "py-2 pr-4 text-right font-medium md:pr-5")}>
                %
              </th>
            </tr>
          </thead>

          <tbody>
            {lines.map((l) => {
              const isOpen = open.has(l.code);
              const variation = unwritten.get(l.code);
              const flags = getLineRecords(projectId, l.code).filter(
                (r) => r.note && /duplicate|no purchase order/i.test(r.note)
              );
              const spent = l.forecastAmount === 0 ? 0 : Math.min(1, l.actualAmount / l.forecastAmount);
              const panelId = `line-${l.code}-records`;

              return (
                <Fragment key={l.code}>
                  <tr
                    id={`line-${l.code}`}
                    onClick={() => onToggle(l.code)}
                    className={cn(
                      "cursor-pointer scroll-mt-24 border-b border-border transition-colors duration-700",
                      isOpen ? "bg-foreground/[0.035]" : "hover:bg-foreground/[0.025]",
                      highlighted === l.code && "bg-foreground/[0.09] duration-0"
                    )}
                  >
                    <td className="py-[7px] pl-3">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-label={`${isOpen ? "Close" : "Open"} ${l.description}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(l.code);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                      >
                        <ChevronRight
                          className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-90")}
                        />
                      </button>
                    </td>
                    <td className="py-[7px] pr-3">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11.5px] text-muted-foreground">
                        <span
                          className={cn("h-1.5 w-1.5 shrink-0", l.isForecastOver ? "bg-over" : "bg-transparent")}
                          aria-hidden="true"
                        />
                        {l.code}
                      </span>
                    </td>
                    <td className="py-[7px] pr-3">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-medium">{l.description}</span>
                        {l.isForecastOver ? <span className="sr-only">(over forecast)</span> : null}
                        {variation ? (
                          <span
                            className="rounded-sm border border-warn-border px-1 text-[10.5px] font-medium leading-[15px] text-warn"
                            title={`${variation.id} was approved but its budget has not been updated`}
                          >
                            Variation not in budget
                          </span>
                        ) : null}
                        {flags.map((f) => (
                          <span
                            key={f.id}
                            className="rounded-sm border border-over-border px-1 text-[10.5px] font-medium leading-[15px] text-over"
                          >
                            {/duplicate/i.test(f.note!) ? "Duplicate bill" : "No PO"}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className={cn(wide, "py-[7px] pr-3 text-right")}>{formatCurrency(l.budgetAmount)}</td>
                    <td className={cn(wide, "py-[7px] pr-3 text-right text-muted-foreground")}>
                      {formatCurrency(l.committedAmount)}
                    </td>
                    <td className={cn(wide, "py-[7px] pr-3 text-right")}>{formatCurrency(l.actualAmount)}</td>
                    <td className="hidden py-[7px] pr-3 lg:table-cell xl:pr-5">
                      <span className="flex items-center gap-2 xl:flex-col-reverse xl:items-stretch xl:gap-1">
                        <span className="relative h-[5px] flex-1 bg-foreground/10 xl:h-[3px] xl:flex-none" aria-hidden="true">
                          <span className="absolute inset-y-0 left-0 bg-foreground/60" style={{ width: `${spent * 100}%` }} />
                        </span>
                        <span className="tabular w-8 text-right text-[11.5px] leading-none text-muted-foreground xl:w-auto">
                          {Math.round(spent * 100)}%
                        </span>
                      </span>
                    </td>
                    <td className="hidden py-[7px] pr-3 text-right sm:table-cell">{formatCurrency(l.forecastAmount)}</td>
                    <td
                      className={cn(
                        "py-[7px] pr-3 text-right",
                        l.isForecastOver ? "font-semibold text-over" : "text-muted-foreground"
                      )}
                    >
                      {l.forecastVariance === 0 ? "—" : formatSignedCurrency(l.forecastVariance)}
                    </td>
                    <td
                      className={cn(
                        wide,
                        "py-[7px] pr-4 text-right md:pr-5",
                        l.isForecastOver ? "text-over" : "text-muted-foreground"
                      )}
                    >
                      {l.forecastVariance === 0 ? "—" : formatSignedPct(l.forecastVariancePct)}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr id={panelId} className="border-b border-border bg-chrome/70">
                      <td colSpan={COLUMN_COUNT} className="p-0">
                        <div className="duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none">
                          <LineRecords line={l} />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {lines.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-5 py-6 text-center text-[13px] text-muted-foreground">
                  No cost code is forecast over budget on this project.
                </td>
              </tr>
            ) : null}
          </tbody>

          <tfoot>
            <tr className="border-t border-foreground font-semibold">
              <td />
              <td colSpan={2} className="py-2.5 pr-3">
                Total{overOnly ? <span className="font-normal text-muted-foreground"> — all {allLines.length} codes</span> : null}
              </td>
              <td className={cn(wide, "py-2.5 pr-3 text-right")}>{formatCurrency(totals.budget)}</td>
              <td className={cn(wide, "py-2.5 pr-3 text-right")}>{formatCurrency(totals.committed)}</td>
              <td className={cn(wide, "py-2.5 pr-3 text-right")}>{formatCurrency(totals.actual)}</td>
              <td className="hidden py-2.5 pr-3 text-right text-[11.5px] font-normal text-muted-foreground lg:table-cell xl:pr-5">
                {Math.round((totals.actual / totals.forecast) * 100)}%
              </td>
              <td className="hidden py-2.5 pr-3 text-right sm:table-cell">{formatCurrency(totals.forecast)}</td>
              <td className={cn("py-2.5 pr-3 text-right", totalVariance > 0 ? "text-over" : "")}>
                {formatSignedCurrency(totalVariance)}
              </td>
              <td className={cn(wide, "py-2.5 pr-4 text-right md:pr-5", totalVariance > 0 ? "text-over" : "")}>
                {formatSignedPct((totalVariance / totals.budget) * 100)}
              </td>
            </tr>
          </tfoot>
        </table>
        {/* The accountant's double rule under a total. */}
        <div aria-hidden="true" className="h-[5px] min-w-full border-y border-foreground" />
      </div>
    </section>
  );
}
