import Link from "next/link";
import { ProjectStatusBadge } from "@/components/status-badge";
import { SourceBadge } from "@/components/source-badge";
import { getPortfolioLedger, getPortfolioTotals } from "@/lib/derive";
import { formatCurrency, formatPct, formatSignedCurrency, formatSignedPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The portfolio as a ledger: one row per project, largest overrun by
 * percentage first. The bar column puts every project on one shared axis of
 * variance at completion, so a 6% overrun on a $742k job reads against a 1%
 * saving on a $3M one without the big job's size drowning it out.
 *
 * The percent folds under the variance amount in both sets and at every width:
 * rows are ranked by it, so a phone showing dollars alone would look unsorted. `compact` is the
 * dashboard's column set; `full` adds margin (tender to forecast) for the
 * projects list. From xl the
 * compact table is fixed to the sheet's 12-column lines:
 *   code and project 1-3 · status 4 · budget 5 · committed 6 · actual 7 ·
 *   spent 8 | variance bar 9-10 · forecast 11 · variance 12
 * The 8 line divides spend to date from the position at completion, as it does
 * on the project page and in the split below the table.
 */
export function ProjectsTable({ variant = "full" }: { variant?: "full" | "compact" }) {
  const rows = getPortfolioLedger();
  const totals = getPortfolioTotals();
  const full = variant === "full";

  const pcts = rows.map((r) => r.variancePct);
  const min = Math.floor((Math.min(0, ...pcts) - 1) / 5) * 5;
  const max = Math.ceil((Math.max(0, ...pcts) + 1) / 5) * 5;
  const ticks: number[] = [];
  for (let t = min; t <= max; t += 5) ticks.push(t);
  const x = (v: number) => ((v - min) / (max - min)) * 100;

  const totalVariance = totals.forecast - totals.budget;
  const totalPct = (totalVariance / totals.budget) * 100;

  /** When each column appears. Compact keeps committed for xl, where it has its own grid column. */
  const show = {
    status: "hidden md:table-cell",
    budget: "hidden md:table-cell",
    committed: full ? "hidden lg:table-cell" : "hidden xl:table-cell",
    actual: "hidden md:table-cell",
    // The full set already carries committed and margin; spent waits for 2xl there.
    spent: full ? "hidden 2xl:table-cell" : "hidden xl:table-cell",
    bar: "hidden lg:table-cell",
    forecast: "hidden sm:table-cell",
    margin: "hidden xl:table-cell",
  };
  /** The last visible column carries the sheet margin. */
  const varianceEdge = full ? "pr-4 md:pr-5 xl:pr-3" : "pr-4 md:pr-5";

  const num = "tabular pr-3 text-right";
  const tagged = "inline-flex items-center gap-1.5 lg:flex-col lg:items-end lg:gap-0.5";

  function Bar({ pct, strong }: { pct: number; strong?: boolean }) {
    const over = pct > 0;
    const left = x(Math.min(0, pct));
    const width = Math.max(Math.abs(x(pct) - x(0)), 0.6);
    return (
      <span className="relative block h-5" aria-hidden="true">
        {ticks.map((t) => (
          <span
            key={t}
            className={cn("absolute inset-y-0 w-px", t === 0 ? "bg-foreground/60" : "bg-border/70")}
            style={{ left: `${x(t)}%` }}
          />
        ))}
        <span
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            strong ? "h-[8px]" : "h-[10px]",
            over ? "bg-over" : "bg-foreground/30"
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </span>
    );
  }

  /** Actual against budget, as the spec's mini meter: the figure over a hairline bar. */
  function Spent({ actual, budget }: { actual: number; budget: number }) {
    const share = budget === 0 ? 0 : actual / budget;
    return (
      <span className="flex flex-col items-stretch gap-1">
        <span className="tabular text-right text-[11.5px] leading-none text-muted-foreground">
          {Math.round(share * 100)}%
        </span>
        <span className="relative h-[3px] bg-foreground/10" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 bg-foreground/60" style={{ width: `${Math.min(1, share) * 100}%` }} />
        </span>
      </span>
    );
  }

  function Variance({ value, pct, bold }: { value: number; pct: number; bold?: boolean }) {
    const over = value > 0;
    return (
      <>
        <span className={cn("block", over ? cn("text-over", bold && "font-semibold") : "text-muted-foreground")}>
          {value === 0 ? "—" : formatSignedCurrency(value)}
        </span>
        <span className={cn("block text-[11.5px] font-normal", over ? "text-over" : "text-muted-foreground")}>
          {value === 0 ? "—" : formatSignedPct(pct)}
        </span>
      </>
    );
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full text-[13px]", !full && "xl:table-fixed")}>
        {!full ? (
          <colgroup>
            <col className="xl:w-20" />
            <col />
            <col className="xl:w-[8.3333%]" />
            <col className="xl:w-[8.3333%]" />
            <col className="xl:w-[8.3333%]" />
            <col className="xl:w-[8.3333%]" />
            <col className="xl:w-[8.3333%]" />
            <col className="xl:w-[16.6667%]" />
            <col className="xl:w-[8.3333%]" />
            <col className="xl:w-[8.3333%]" />
          </colgroup>
        ) : null}
        <thead>
          <tr className="border-b border-border align-bottom text-[11.5px] font-medium text-muted-foreground">
            <th scope="col" className="py-2 pl-4 pr-3 text-left font-medium md:pl-5">
              Code
            </th>
            <th scope="col" className="py-2 pr-3 text-left font-medium">
              Project
            </th>
            <th scope="col" className={cn(show.status, "py-2 pr-3 text-left font-medium")}>
              Status
            </th>
            <th scope="col" className={cn(show.budget, num, "py-2 font-medium")}>
              <span className={tagged}>
                Budget <SourceBadge system="CostX" short />
              </span>
            </th>
            <th scope="col" className={cn(show.committed, num, "py-2 font-medium")}>
              <span className={tagged}>
                Committed <SourceBadge system="ApprovalMax" short />
              </span>
            </th>
            <th scope="col" className={cn(show.actual, num, "py-2 font-medium")}>
              <span className={tagged}>
                Actual <SourceBadge system="Xero" short />
              </span>
            </th>
            <th scope="col" className={cn(show.spent, "py-2 pr-5 text-right font-medium")}>
              Spent of budget
            </th>
            <th scope="col" className={cn(show.bar, "py-2 font-medium", full ? "w-48 min-w-[9rem] pr-4" : "pr-5")}>
              <span className="block text-left">Variance at completion</span>
              <span className="relative mt-1 block h-3.5 text-[10.5px] font-normal">
                {ticks.map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      "tabular absolute whitespace-nowrap",
                      i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
                      t === 0 && "text-foreground"
                    )}
                    style={{ left: `${x(t)}%` }}
                  >
                    {t > 0 ? `+${t}%` : `${t}%`}
                  </span>
                ))}
              </span>
            </th>
            <th
              scope="col"
              className={cn(show.forecast, num, "py-2 font-medium")}
              title="Forecast cost at completion, set by each project manager"
            >
              Forecast
            </th>
            <th scope="col" className={cn(num, varianceEdge, "py-2 font-medium")}>
              Variance
            </th>
            {full ? (
              <th scope="col" className={cn(show.margin, num, "whitespace-nowrap py-2 pr-4 font-medium md:pr-5")}>
                <span className={tagged}>
                  Margin <span className="font-normal">tender → forecast</span>
                </span>
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {rows.map((p) => (
            <tr
              key={p.id}
              className="group relative border-b border-border transition-colors duration-150 hover:bg-foreground/[0.025]"
            >
              <td className={cn("py-2 pl-4 pr-3 md:pl-5", !full && "xl:pr-2")}>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11.5px] text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 shrink-0", p.over ? "bg-over" : "bg-transparent")} aria-hidden="true" />
                  {p.id}
                </span>
              </td>
              <td className="py-2 pr-3">
                {/* The name's link stretches over the whole row. */}
                <Link
                  href={`/projects/${p.id}`}
                  className="whitespace-nowrap font-medium after:absolute after:inset-0 after:content-[''] group-hover:underline"
                >
                  {p.name}
                </Link>
                {p.over ? <span className="sr-only"> (forecast over budget)</span> : null}
                <span className="block truncate text-[12px] text-muted-foreground">{p.client}</span>
              </td>
              <td className={cn(show.status, "py-2 pr-3")}>
                <ProjectStatusBadge status={p.status} />
              </td>
              <td className={cn(show.budget, num, "py-2")}>{formatCurrency(p.budgetTotal)}</td>
              <td className={cn(show.committed, num, "py-2 text-muted-foreground")}>{formatCurrency(p.committedTotal)}</td>
              <td className={cn(show.actual, num, "py-2")}>{formatCurrency(p.actualTotal)}</td>
              <td className={cn(show.spent, "py-2 pr-5")}>
                <Spent actual={p.actualTotal} budget={p.budgetTotal} />
              </td>
              <td className={cn(show.bar, "py-2", full ? "pr-4" : "pr-5")}>
                <Bar pct={p.variancePct} />
              </td>
              <td className={cn(show.forecast, num, "py-2")}>{formatCurrency(p.forecastFinal)}</td>
              <td className={cn(num, varianceEdge, "py-2")}>
                <Variance value={p.variance} pct={p.variancePct} bold />
              </td>
              {full ? (
                <td className={cn(show.margin, num, "whitespace-nowrap py-2 pr-4 md:pr-5")}>
                  <span className="text-muted-foreground">{formatPct(p.budgetMarginPct)} → </span>
                  <span
                    className={cn("font-medium", p.forecastMarginPct < p.budgetMarginPct ? "text-over" : "text-foreground")}
                  >
                    {formatPct(p.forecastMarginPct)}
                  </span>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="border-t border-foreground font-semibold">
            <td colSpan={2} className="py-2.5 pl-4 pr-3 md:pl-5">
              Portfolio
            </td>
            <td className={show.status} />
            <td className={cn(show.budget, num, "py-2.5")}>{formatCurrency(totals.budget)}</td>
            <td className={cn(show.committed, num, "py-2.5")}>{formatCurrency(totals.committed)}</td>
            <td className={cn(show.actual, num, "py-2.5")}>{formatCurrency(totals.actual)}</td>
            <td className={cn(show.spent, "py-2.5 pr-5 font-normal")}>
              <Spent actual={totals.actual} budget={totals.budget} />
            </td>
            <td className={cn(show.bar, "py-2.5", full ? "pr-4" : "pr-5")}>
              <Bar pct={totalPct} strong />
            </td>
            <td className={cn(show.forecast, num, "py-2.5")}>{formatCurrency(totals.forecast)}</td>
            <td className={cn(num, varianceEdge, "py-2.5")}>
              <Variance value={totalVariance} pct={totalPct} />
            </td>
            {full ? (
              <td className={cn(show.margin, num, "whitespace-nowrap py-2.5 pr-4 md:pr-5")}>
                <span className="font-normal text-muted-foreground">{formatPct(totals.budgetMarginPct)} → </span>
                <span className={totals.forecastMarginPct < totals.budgetMarginPct ? "text-over" : ""}>
                  {formatPct(totals.forecastMarginPct)}
                </span>
              </td>
            ) : null}
          </tr>
        </tfoot>
      </table>
      {/* The accountant's double rule under a total. */}
      <div aria-hidden="true" className="h-[5px] min-w-full border-y border-foreground" />
    </div>
  );
}
