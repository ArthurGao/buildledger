"use client";

import * as React from "react";
import { Check, Inbox, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FlagBadge } from "@/components/status-badge";
import { SourceBadge } from "@/components/source-badge";
import { ApprovalChain } from "@/components/approvals/approval-chain";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { EmptyState } from "@/components/empty-state";
import { useDemoState } from "@/lib/demo-state";
import { ageInDays, getProjectName } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export function ApprovalQueue() {
  const { invoices, approvalSteps, approveInvoice, rejectInvoice } = useDemoState();
  const [selected, setSelected] = React.useState<Invoice | null>(null);
  const [open, setOpen] = React.useState(false);

  const queue = invoices.filter((i) => i.status === "Pending approval");
  const live = selected ? (invoices.find((i) => i.id === selected.id) ?? null) : null;

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-5 w-5" />}
        title="Nothing waiting on an approver"
        description="Every invoice in the pipeline has been actioned. New ones land here as soon as EzzyBills codes them."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Invoice</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Requested by</TableHead>
            <TableHead>
              <span className="inline-flex items-center gap-1.5">
                Current approver <SourceBadge system="ApprovalMax" short />
              </span>
            </TableHead>
            <TableHead className="text-right">Age</TableHead>
            <TableHead className="w-[172px] text-right">Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queue.map((invoice) => {
            const current = approvalSteps.find((s) => s.invoiceId === invoice.id && s.status === "Waiting");
            const age = ageInDays(invoice.date);
            const flagged = (invoice.flags?.length ?? 0) > 0;

            return (
              <TableRow key={invoice.id} className={cn(flagged && "bg-over-soft/40")}>
                <TableCell className="py-3">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => {
                      setSelected(invoice);
                      setOpen(true);
                    }}
                  >
                    <span className="font-mono text-sm font-medium hover:text-primary">
                      {invoice.invoiceNumber}
                    </span>
                    <span className="block text-xs text-muted-foreground">{invoice.supplier}</span>
                  </button>
                  {flagged ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {invoice.flags!.map((f) => (
                        <FlagBadge key={f} flag={f} />
                      ))}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm">{getProjectName(invoice.projectId)}</TableCell>
                <TableCell className="tabular text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{invoice.requestedBy}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <ApprovalChain invoiceId={invoice.id} compact />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{current?.approver ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{current?.role ?? ""}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="tabular text-right">
                  <span className={cn("text-sm", age >= 7 ? "font-medium text-warn" : "text-muted-foreground")}>
                    {age}d
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => rejectInvoice(invoice.id)}>
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button size="sm" variant="success" onClick={() => approveInvoice(invoice.id)}>
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <InvoiceDialog invoice={live} open={open} onOpenChange={setOpen} />
    </>
  );
}
