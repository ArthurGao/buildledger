"use client";

import * as React from "react";
import { format } from "date-fns";
import { Mail, Upload } from "lucide-react";
import { FlagBadge } from "@/components/status-badge";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { PIPELINE, useDemoState } from "@/lib/demo-state";
import { getProjectName } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/lib/types";

/** Which system owns each stage — drives the column accent colour. */
const stageAccent: Record<InvoiceStatus, string> = {
  Captured: "bg-src-ezzybills",
  Coded: "bg-src-ezzybills",
  "Pending approval": "bg-src-approvalmax",
  Approved: "bg-src-approvalmax",
  "Awaiting payment": "bg-src-xero",
  Paid: "bg-src-xero",
};

function InvoiceCard({
  invoice,
  highlighted,
  onOpen,
}: {
  invoice: Invoice;
  highlighted: boolean;
  onOpen: () => void;
}) {
  const SourceIcon = invoice.source === "Email" ? Mail : Upload;
  const flagged = (invoice.flags?.length ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-md border bg-card p-3 text-left shadow-card transition-all hover:-translate-y-px hover:shadow-card-hover",
        flagged ? "border-over-border" : "border-border",
        highlighted && "ring-2 ring-primary ring-offset-1"
      )}
    >
      <p className="truncate text-sm font-medium">{invoice.supplier}</p>
      <p className="tabular mt-1 text-base font-semibold">{formatCurrency(invoice.amount)}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{getProjectName(invoice.projectId)}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="tabular font-mono text-[11px] text-muted-foreground">{invoice.invoiceNumber}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <SourceIcon className="h-3 w-3" />
          {format(new Date(invoice.date), "d MMM")}
        </span>
      </div>
      {flagged ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {invoice.flags!.map((f) => (
            <FlagBadge key={f} flag={f} />
          ))}
        </div>
      ) : null}
    </button>
  );
}

export function PipelineBoard() {
  const { invoices, touched } = useDemoState();
  const [selected, setSelected] = React.useState<Invoice | null>(null);
  const [open, setOpen] = React.useState(false);

  // Keep the open dialog in step with state changes made from inside it.
  const live = selected ? (invoices.find((i) => i.id === selected.id) ?? null) : null;

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {PIPELINE.map((stage) => {
          const items = invoices.filter((i) => i.status === stage);
          const total = items.reduce((sum, i) => sum + i.amount, 0);

          return (
            <section key={stage} className="flex min-w-0 flex-col rounded-lg bg-muted/50 p-2.5">
              <header className="mb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", stageAccent[stage])} />
                  <h2 className="truncate text-xs font-semibold">{stage}</h2>
                  <span className="tabular ml-auto rounded bg-card px-1.5 text-[11px] font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <p className="tabular mt-1 pl-3.5 text-[11px] text-muted-foreground">
                  {total > 0 ? formatCurrency(total) : "—"}
                </p>
              </header>

              <div className="flex flex-col gap-2">
                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-[11px] text-muted-foreground">
                    Nothing here
                  </p>
                ) : (
                  items.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      highlighted={touched.includes(invoice.id)}
                      onOpen={() => {
                        setSelected(invoice);
                        setOpen(true);
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <InvoiceDialog invoice={live} open={open} onOpenChange={setOpen} />
    </>
  );
}
