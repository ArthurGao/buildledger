import Link from "next/link";
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
  "Variation notice due": ["M365", "CostX"],
  "Variation notice overdue": ["M365", "CostX"],
  "Retention shortfall": ["Xero"],
};

/**
 * Columns shared by the header row and every exception row. From lg they are
 * the sheet's 12 zero-gutter columns: exception 1-5 · project 6-7 · detected
 * from 8-9 · amount 10 · link 11-12, so the amounts' right edge sits on line 10
 * and the summary figures above split on lines 5 and 9.
 */
export const exceptionColumns =
  "grid grid-cols-[1rem_minmax(0,1fr)_auto] gap-x-3 px-4 md:px-5 lg:grid-cols-12 lg:gap-x-0 lg:px-0";
/** Marker and text: two cells of the phone grid, one five-column cell from lg. */
export const exceptionLead = "contents lg:col-span-5 lg:grid lg:grid-cols-[1rem_minmax(0,1fr)] lg:gap-x-3 lg:pl-5 lg:pr-3";
export const exceptionCells = {
  project: "lg:col-span-2 lg:pr-3",
  detected: "lg:col-span-2 lg:pr-3",
  amount: "lg:col-span-1 lg:pr-3",
  link: "lg:col-span-2 lg:pr-5",
};

/**
 * One exception as a ledger row: marker, what and why, where, who caught it,
 * amount, the way in. Dense like an issue stream: the id and severity ride on
 * the title line, and the whole row opens the record.
 */
export function ExceptionRow({ exception: e }: { exception: ExceptionItem }) {
  const high = e.severity === "High";
  const href = e.relatedInvoiceId ? "/invoices" : `/projects/${e.projectId}`;

  return (
    <li
      className={cn(
        exceptionColumns,
        "group relative gap-y-1 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.025]"
      )}
    >
      <div className={exceptionLead}>
        <span aria-hidden="true" className={cn("mt-[5px] h-2 w-2", high ? "bg-over" : "bg-warn")} />

        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[13px] leading-5">
            <span className="font-medium group-hover:underline">{e.type}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{e.id}</span>
            <span className={cn("text-[11.5px] font-medium", high ? "text-over" : "text-warn")}>{e.severity}</span>
          </p>
          <p className="max-w-[72ch] text-[12.5px] leading-snug text-muted-foreground">{e.description}</p>
          {/* Below lg the project and sources fold into one meta line under the description. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-muted-foreground lg:hidden">
            <span className="font-mono text-[11px]">{e.projectId}</span>
            <span className="mr-1">{getProjectName(e.projectId)}</span>
            <span className="inline-flex gap-1">
              {detectedBy[e.type].map((s) => (
                <SourceBadge key={s} system={s} short />
              ))}
            </span>
          </p>
        </div>
      </div>

      <p className={cn(exceptionCells.project, "hidden min-w-0 text-[12.5px] leading-5 lg:block")}>
        <span className="font-mono text-[11px] text-muted-foreground">{e.projectId}</span>
        <span className="block truncate leading-snug">{getProjectName(e.projectId)}</span>
      </p>

      <p className={cn(exceptionCells.detected, "hidden flex-wrap content-start gap-1 pt-0.5 lg:flex")}>
        {detectedBy[e.type].map((s) => (
          <SourceBadge key={s} system={s} short />
        ))}
      </p>

      <p
        className={cn(
          exceptionCells.amount,
          "tabular text-right text-[13px] leading-5",
          high ? "font-semibold text-over" : "font-medium"
        )}
      >
        {e.amount ? formatCurrency(e.amount) : <span className="font-normal text-muted-foreground">—</span>}
      </p>

      <p className={cn(exceptionCells.link, "text-right text-[12px] leading-5 max-lg:absolute max-lg:inset-0")}>
        {/* The link stretches over the whole row, as the portfolio ledger's project names
            do; on phones the row itself is the tap target and the label is for screen readers. */}
        <Link
          href={href}
          className="whitespace-nowrap text-muted-foreground underline-offset-2 after:absolute after:inset-0 after:content-[''] hover:text-foreground group-hover:text-foreground focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
        >
          <span className="max-lg:sr-only">{e.relatedInvoiceId ? `View ${e.relatedInvoiceId}` : "View project"}</span>
        </Link>
      </p>
    </li>
  );
}
