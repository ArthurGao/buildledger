"use client";

import * as React from "react";
import { Mail, Upload } from "lucide-react";
import { FlagBadge } from "@/components/status-badge";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { PIPELINE, useDemoState } from "@/lib/demo-state";
import { getProjectName } from "@/lib/derive";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/lib/types";

/** Which system owns each stage — shown as a small square in that system's hue. */
const stageSystem: Record<InvoiceStatus, string> = {
  Captured: "bg-src-ezzybills",
  Coded: "bg-src-ezzybills",
  "Pending approval": "bg-src-approvalmax",
  Approved: "bg-src-approvalmax",
  "Awaiting payment": "bg-src-xero",
  Paid: "bg-src-xero",
};

/**
 * Columns shared by every invoice row. From lg they are the sheet's 12 lines:
 * supplier and project 1-4 · invoice number 5-6 · received 7-8 · flags 9-10 ·
 * amount 11-12.
 */
const rowColumns =
  "grid grid-cols-[0.375rem_minmax(0,1fr)_auto] gap-x-3 px-4 md:px-5 lg:grid-cols-12 lg:gap-x-0 lg:px-0";
const cells = {
  lead: "contents lg:col-span-4 lg:grid lg:grid-cols-[0.375rem_minmax(0,1fr)] lg:gap-x-3 lg:pl-5 lg:pr-3",
  number: "hidden lg:col-span-2 lg:block lg:pr-3",
  received: "hidden lg:col-span-2 lg:block lg:pr-3",
  flags: "hidden lg:col-span-2 lg:flex lg:pr-3",
  amount: "lg:col-span-2 lg:pr-5",
};

function InvoiceRow({ invoice, highlighted, onOpen }: { invoice: Invoice; highlighted: boolean; onOpen: () => void }) {
  const SourceIcon = invoice.source === "Email" ? Mail : Upload;
  const flagged = (invoice.flags?.length ?? 0) > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          rowColumns,
          "w-full items-start py-2.5 text-left transition-colors duration-150 hover:bg-foreground/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          // What the viewer just moved stays marked for the rest of the session.
          highlighted && "bg-foreground/[0.04]"
        )}
      >
        <span className={cells.lead}>
          <span aria-hidden="true" className={cn("mt-[6px] h-1.5 w-1.5", flagged ? "bg-over" : "bg-transparent")} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium">{invoice.supplier}</span>
            <span className="block truncate text-[12px] text-muted-foreground">{getProjectName(invoice.projectId)}</span>
            {/* Below lg the reference, date and flags fold under the supplier. */}
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground lg:hidden">
              <span className="font-mono text-[11px]">{invoice.invoiceNumber}</span>
              <span className="inline-flex items-center gap-1">
                <SourceIcon className="h-3 w-3" />
                {formatDateShort(invoice.date)}
              </span>
              {invoice.flags?.map((f) => <FlagBadge key={f} flag={f} />)}
            </span>
          </span>
        </span>
        <span className={cn(cells.number, "pt-0.5 font-mono text-[11.5px] text-muted-foreground")}>
          {invoice.invoiceNumber}
        </span>
        <span className={cn(cells.received, "items-center gap-1 pt-0.5 text-[12px] text-muted-foreground lg:flex")}>
          <SourceIcon className="h-3 w-3" />
          {invoice.source === "Email" ? "Email" : "Upload"} · {formatDateShort(invoice.date)}
        </span>
        <span className={cn(cells.flags, "flex-wrap gap-1")}>
          {invoice.flags?.map((f) => <FlagBadge key={f} flag={f} />)}
        </span>
        <span className={cn(cells.amount, "tabular text-right text-[13px] font-medium")}>
          {formatCurrency(invoice.amount)}
        </span>
      </button>
    </li>
  );
}

/**
 * The invoice run as one ruled ledger, a section per stage in pipeline order.
 * Each stage head names the system that owns it and carries its count and total.
 */
export function PipelineBoard() {
  const { invoices, touched } = useDemoState();
  const [selected, setSelected] = React.useState<Invoice | null>(null);
  const [open, setOpen] = React.useState(false);

  // Keep the open dialog in step with state changes made from inside it.
  const live = selected ? (invoices.find((i) => i.id === selected.id) ?? null) : null;

  return (
    <>
      <div className="divide-y divide-border">
        {PIPELINE.map((stage) => {
          const items = invoices.filter((i) => i.status === stage);
          const total = items.reduce((sum, i) => sum + i.amount, 0);
          const id = `stage-${stage.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <section key={stage} aria-labelledby={id}>
              <header className="flex items-baseline gap-2 bg-foreground/[0.02] px-4 py-2 md:px-5">
                <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 self-center", stageSystem[stage])} />
                <h3 id={id} className="text-[12px] font-semibold">
                  {stage}
                </h3>
                <span className="tabular text-[12px] text-muted-foreground">{items.length}</span>
                <span className="tabular ml-auto text-[12px] font-medium">{total > 0 ? formatCurrency(total) : "—"}</span>
              </header>

              {items.length === 0 ? (
                <p className="border-t border-border px-4 py-2.5 text-[12px] text-muted-foreground md:px-5">Nothing here</p>
              ) : (
                <ul className="divide-y divide-border border-t border-border">
                  {items.map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      highlighted={touched.includes(invoice.id)}
                      onOpen={() => {
                        setSelected(invoice);
                        setOpen(true);
                      }}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <InvoiceDialog invoice={live} open={open} onOpenChange={setOpen} />
    </>
  );
}
