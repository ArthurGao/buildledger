"use client";

import { SourceBadge } from "@/components/source-badge";
import { getBridgeAxis, getForecastBridge } from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

interface Row {
  key: string;
  label: string;
  code?: string;
  from: number;
  to: number;
  kind: "total" | "step";
  /** Step value, or the total itself. */
  value: number;
}

/**
 * Budget to forecast as a bridge. The axis is cut well above zero so a few
 * thousand dollars on a trade are visible against a total of hundreds of
 * thousands — the two total bars carry a break mark to say so. Each trade step
 * is a button: choosing one opens that cost code in the table below.
 */
export function ForecastBridge({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (code: string) => void;
}) {
  const steps = getForecastBridge(project.id);
  const rows: Row[] = [
    { key: "budget", label: "Budget", from: 0, to: project.budgetTotal, kind: "total", value: project.budgetTotal },
  ];
  let running = project.budgetTotal;
  for (const s of steps) {
    rows.push({
      key: s.code,
      label: s.description,
      code: s.folded ? undefined : s.code,
      from: running,
      to: running + s.delta,
      kind: "step",
      value: s.delta,
    });
    running += s.delta;
  }
  rows.push({
    key: "forecast",
    label: "Forecast at completion",
    from: 0,
    to: project.forecastFinal,
    kind: "total",
    value: project.forecastFinal,
  });

  const { min, max, ticks } = getBridgeAxis(project.id);

  const x = (v: number) => ((Math.max(v, min) - min) / (max - min)) * 100;
  const overall = project.forecastFinal > project.budgetTotal;

  return (
    <div>
      <div role="list" aria-label="Budget to forecast, by trade">
        {rows.map((r, i) => {
          const left = r.kind === "total" ? 0 : x(Math.min(r.from, r.to));
          const width = r.kind === "total" ? x(r.to) : Math.max(x(Math.max(r.from, r.to)) - left, 0.4);
          const over = r.kind === "step" ? r.value > 0 : r.key === "forecast" && overall;
          const prevEnd = i > 0 ? x(rows[i - 1].to) : null;
          const interactive = Boolean(r.code);

          const content = (
            <>
              <span className="flex min-w-0 items-center gap-1.5 pr-3 xl:col-span-3 xl:pl-12">
                {r.code ? (
                  <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline xl:w-[3.375rem] xl:shrink-0">
                    {r.code}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "line-clamp-2 leading-tight sm:truncate",
                    r.kind === "total" ? "font-semibold" : "text-foreground/85",
                    interactive && "group-hover:text-foreground group-hover:underline"
                  )}
                >
                  {r.key === "forecast" ? (
                    <>
                      <span className="sm:hidden">Forecast</span>
                      <span className="hidden sm:inline">{r.label}</span>
                    </>
                  ) : (
                    r.label
                  )}
                </span>
                {r.key === "budget" ? <SourceBadge system="CostX" short /> : null}
              </span>

              <span className="relative h-full xl:col-span-4">
                {ticks.map((t) => (
                  <span
                    key={t}
                    aria-hidden="true"
                    className="absolute inset-y-0 w-px bg-border/70"
                    style={{ left: `${x(t)}%` }}
                  />
                ))}
                {prevEnd !== null && r.kind === "step" ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-[9px] border-l border-dashed border-foreground/40"
                    style={{ left: `${prevEnd}%` }}
                  />
                ) : null}
                {r.key === "forecast" && prevEnd !== null ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-[9px] border-l border-dashed border-foreground/40"
                    style={{ left: `${prevEnd}%` }}
                  />
                ) : null}
                <span
                  className={cn(
                    "absolute top-[9px] h-[14px]",
                    r.kind === "total" ? (over ? "bg-over" : "bg-foreground") : over ? "bg-over" : "bg-foreground/30"
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {r.kind === "total" ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 8 14"
                      preserveAspectRatio="none"
                      className="absolute left-[10px] top-0 h-full w-2 text-card"
                    >
                      <path d="M1 14 L4 0 M4 14 L7 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  ) : null}
                </span>
              </span>

              <span
                className={cn(
                  "text-right tabular xl:pr-5",
                  r.kind === "total" ? "font-semibold" : "font-medium",
                  over ? "text-over" : r.kind === "step" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {r.kind === "total" ? formatCurrency(r.value) : formatSignedCurrency(r.value)}
              </span>
            </>
          );

          // From xl the row is full-bleed and sits on the sheet's own 12-column
          // lines: label over columns 1-3, track over 4-7, amount in 8.
          const rowClass =
            "group -mx-2 grid min-h-8 w-[calc(100%+1rem)] grid-cols-[minmax(0,8.5rem)_1fr_4.75rem] rounded-sm px-2 items-stretch text-left text-[12.5px] sm:grid-cols-[minmax(0,12rem)_1fr_5.5rem] xl:mx-0 xl:w-full xl:grid-cols-8 xl:rounded-none xl:px-0 [&>span:first-child]:self-center [&>span:last-child]:self-center";

          return (
            <div role="listitem" key={r.key}>
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onSelect(r.code!)}
                  className={cn(rowClass, "transition-colors duration-150 hover:bg-foreground/[0.04]")}
                  aria-label={`${r.label}: ${formatSignedCurrency(r.value)} on forecast — show cost code ${r.code}`}
                >
                  {content}
                </button>
              ) : (
                <div className={rowClass}>{content}</div>
              )}
            </div>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="mt-1 grid grid-cols-[minmax(0,8.5rem)_1fr_4.75rem] text-[11px] text-muted-foreground sm:grid-cols-[minmax(0,12rem)_1fr_5.5rem] xl:grid-cols-8"
      >
        <span className="xl:col-span-3" />
        <span className="relative h-4 xl:col-span-4">
          {ticks.map((t, i) => (
            <span
              key={t}
              className={cn(
                "tabular absolute whitespace-nowrap",
                i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
                i !== 0 && i !== ticks.length - 1 && "hidden sm:inline"
              )}
              style={{ left: `${x(t)}%` }}
            >
              {formatCompactCurrency(t)}
            </span>
          ))}
        </span>
        <span />
      </div>
      <p className="mt-2 text-[11.5px] text-muted-foreground xl:px-5">
        Axis starts at {formatCurrency(min)}; the budget and forecast bars are cut short. Choose a trade to open it
        below.
      </p>
    </div>
  );
}
