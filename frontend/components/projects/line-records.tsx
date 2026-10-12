import { Fragment } from "react";
import Link from "next/link";
import { SourceBadge } from "@/components/source-badge";
import { getCostCodeMapping, getLineRecords, getVariations } from "@/lib/derive";
import { formatCurrency, formatCurrencyPrecise, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BudgetLineWithVariance, LineRecord } from "@/lib/types";

/** Exceptions are red, anything still waiting on someone is amber, the rest stays quiet. */
function noteTone(part: string) {
  if (/duplicate|no purchase order/i.test(part)) return "font-medium text-over";
  if (/pending|coded|captured|not in actual/i.test(part)) return "font-medium text-warn";
  return undefined;
}

function RecordList({
  title,
  system,
  records,
  totalLabel,
  total,
}: {
  title: string;
  system: "ApprovalMax" | "Xero";
  records: LineRecord[];
  totalLabel: string;
  total: number;
}) {
  return (
    <section className="min-w-0">
      <header className="flex items-center gap-2 border-b border-border pb-1.5">
        <h4 className="text-[12px] font-semibold">{title}</h4>
        <SourceBadge system={system} short />
        <span className="ml-auto text-[11.5px] text-muted-foreground">{records.length}</span>
      </header>
      {records.length === 0 ? (
        <p className="py-3 text-[12px] text-muted-foreground">None recorded against this code yet.</p>
      ) : (
        <ul className="divide-y divide-border/70">
          {records.map((r) => {
            const held = r.kind === "Bill" && !r.inActual;
            return (
              <li key={r.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-1.5 text-[12px]">
                <span className="font-mono text-[11px] text-foreground/80">{r.reference}</span>
                <span className="min-w-0">
                  <span className="block truncate">{r.supplier}</span>
                  <span className="flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-muted-foreground">
                    <span className="tabular">{formatDateShort(r.date)}</span>
                    {r.note
                      ? r.note.split(" · ").map((part) => (
                          <Fragment key={part}>
                            <span aria-hidden="true">·</span>
                            <span className={noteTone(part)}>{part}</span>
                          </Fragment>
                        ))
                      : null}
                    {r.system === "EzzyBills" ? <SourceBadge system="EzzyBills" short /> : null}
                  </span>
                </span>
                <span
                  className={cn("tabular text-right", held ? "text-muted-foreground line-through decoration-foreground/40" : "font-medium")}
                >
                  {formatCurrencyPrecise(r.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="flex items-baseline justify-between border-t border-foreground/70 pt-1.5 text-[12px]">
        <span className="text-muted-foreground">{totalLabel}</span>
        <span className="tabular font-semibold">{formatCurrency(total)}</span>
      </p>
    </section>
  );
}

/**
 * What a cost code is made of: the CostX budget line and its mapping into
 * Xero, the purchase orders that make up committed, and the bills that make up
 * actual. The totals at the foot of each list are the figures in the row above.
 */
export function LineRecords({ line }: { line: BudgetLineWithVariance }) {
  const records = getLineRecords(line.projectId, line.code);
  const orders = records.filter((r) => r.kind === "Purchase order");
  const bills = records.filter((r) => r.kind === "Bill");
  const mapping = getCostCodeMapping(line.code);
  const lineVariations = getVariations(line.projectId).filter((v) => v.costCode === line.code);
  const held = bills.filter((b) => !b.inActual);

  return (
    // From xl the three lists sit on the sheet's 12-column lines (3 | 4 | 5): the
    // budget line ends where the bridge track starts, the bills start where it ends.
    <div className="grid gap-x-8 gap-y-5 px-4 py-4 md:grid-cols-12 md:px-5 xl:gap-x-0 xl:px-0">
      <section className="min-w-0 md:col-span-3 xl:px-5">
        <header className="flex items-center gap-2 border-b border-border pb-1.5">
          <h4 className="text-[12px] font-semibold">Budget line</h4>
          <SourceBadge system="CostX" short />
        </header>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 py-2 text-[12px]">
          <dt className="text-muted-foreground">Code</dt>
          <dd className="font-mono text-[11.5px]">{line.code}</dd>
          <dt className="text-muted-foreground">Budget</dt>
          <dd className="tabular font-medium">{formatCurrency(line.budgetAmount)}</dd>
          <dt className="text-muted-foreground">Forecast</dt>
          <dd className={cn("tabular font-medium", line.isForecastOver && "text-over")}>
            {formatCurrency(line.forecastAmount)}
          </dd>
          <dt className="text-muted-foreground">In Xero</dt>
          <dd>
            {mapping?.xeroAccountCode ? `Account ${mapping.xeroAccountCode}` : "Not mapped"}
            {mapping?.xeroTrackingOption ? (
              <span className="text-muted-foreground"> · {mapping.xeroTrackingOption}</span>
            ) : null}
          </dd>
        </dl>
        {lineVariations.length > 0 ? (
          <div className="border-t border-border pt-2">
            <p className="text-[11.5px] font-medium text-muted-foreground">Variations on this code</p>
            <ul className="mt-1 space-y-1.5">
              {lineVariations.map((v) => (
                <li key={v.id} className="text-[12px] leading-snug">
                  <Link href="/variations" className="hover:underline">
                    <span className="font-mono text-[11px]">{v.id}</span> {v.description}
                  </Link>
                  <span className="block text-[11.5px] text-muted-foreground">
                    {v.status}
                    {v.costImpact ? ` · ${formatCurrency(v.costImpact)}` : " · not yet priced"}
                    {!v.writtenBackToBudget && v.status === "Approved" ? (
                      <span className="font-medium text-warn"> · not in budget</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="min-w-0 md:col-span-4 xl:px-5">
        <RecordList
          title="Purchase orders"
          system="ApprovalMax"
          records={orders}
          totalLabel="Committed"
          total={line.committedAmount}
        />
      </div>

      <div className="min-w-0 md:col-span-5 xl:px-5">
        <RecordList title="Bills" system="Xero" records={bills} totalLabel="Actual" total={line.actualAmount} />
        {held.length > 0 ? (
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            Struck-through bills are shown but not counted in actual. All amounts exclude GST.
          </p>
        ) : (
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">All amounts exclude GST.</p>
        )}
      </div>
    </div>
  );
}
