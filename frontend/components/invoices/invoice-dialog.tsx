"use client";

import { Check, FileText, Mail, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SourceBadge } from "@/components/source-badge";
import { FlagBadge, InvoiceStatusBadge } from "@/components/status-badge";
import { ApprovalChain } from "@/components/approvals/approval-chain";
import { useDemoState } from "@/lib/demo-state";
import { getProjectName } from "@/lib/derive";
import { formatCurrencyPrecise, formatDateLong } from "@/lib/format";
import type { Invoice } from "@/lib/types";

function Field({ label, value, source }: { label: string; value: React.ReactNode; source?: "EzzyBills" | "Xero" }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {source ? <SourceBadge system={source} short /> : null}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

export function InvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { approveInvoice, rejectInvoice, advanceInvoice } = useDemoState();
  if (!invoice) return null;

  const SourceIcon = invoice.source === "Email" ? Mail : Upload;
  const isPending = invoice.status === "Pending approval";
  const canAdvance = invoice.status !== "Paid" && !isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <DialogTitle className="font-mono">{invoice.invoiceNumber}</DialogTitle>
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.flags?.map((f) => <FlagBadge key={f} flag={f} />)}
          </div>
          <DialogDescription>
            {invoice.supplier} · {getProjectName(invoice.projectId)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Extracted fields
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Supplier" value={invoice.supplier} source="EzzyBills" />
              <Field label="Invoice date" value={formatDateLong(invoice.date)} source="EzzyBills" />
              <Field
                label="Amount (incl. GST)"
                value={<span className="tabular">{formatCurrencyPrecise(invoice.amount)}</span>}
                source="EzzyBills"
              />
              <Field
                label="GST (15%)"
                value={<span className="tabular">{formatCurrencyPrecise(invoice.gst)}</span>}
                source="EzzyBills"
              />
              <Field
                label="Line code"
                value={<span className="font-mono text-xs">{invoice.lineCode}</span>}
                source="Xero"
              />
              <Field
                label="Purchase order"
                value={
                  invoice.hasPO ? (
                    <span className="inline-flex items-center gap-1 text-ok">
                      <Check className="h-3.5 w-3.5" /> Matched
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-over">
                      <X className="h-3.5 w-3.5" /> No matching PO
                    </span>
                  )
                }
                source="Xero"
              />
            </div>

            <Separator />

            <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{invoice.invoiceNumber}.pdf</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <SourceIcon className="h-3 w-3" />
                  Received by {invoice.source.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Approval chain
              </p>
              <SourceBadge system="ApprovalMax" short />
            </div>
            <ApprovalChain invoiceId={invoice.id} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isPending ? (
            <>
              <Button variant="outline" onClick={() => rejectInvoice(invoice.id)}>
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button variant="success" onClick={() => approveInvoice(invoice.id)}>
                <Check className="h-4 w-4" />
                Approve
              </Button>
            </>
          ) : canAdvance ? (
            <Button onClick={() => advanceInvoice(invoice.id)}>Move to next stage</Button>
          ) : (
            <p className="text-xs text-muted-foreground">Paid and reconciled in Xero.</p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
