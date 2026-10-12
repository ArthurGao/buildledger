"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlagBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import type { Invoice, InvoiceFlag } from "@/lib/types";

/** What each flag means for the approver, in the words of the system that raised it. */
const flagMeaning: Record<InvoiceFlag, string> = {
  Duplicate: "A bill with the same supplier reference is already in Xero. Approving may pay it twice.",
  "No PO": "No matching purchase order was found in ApprovalMax. The spend was never approved in advance.",
  "Over budget": "This bill takes its cost code past the CostX budget.",
};

/**
 * Approving a flagged invoice is a deliberate override, so it is never one
 * click: the flags are restated and the approver must give a reason, which is
 * kept in the activity log next to their name.
 */
export function ApproveFlaggedDialog({
  invoice,
  open,
  onOpenChange,
  onApprove,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  const trimmed = reason.trim();

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!invoice) return null;
  const flags = invoice.flags ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px] leading-snug">
            Approve {invoice.invoiceNumber} despite {flags.length === 1 ? "a flag" : `${flags.length} flags`}?
          </DialogTitle>
          <DialogDescription className="text-[12.5px]">
            {invoice.supplier} · <span className="tabular">{formatCurrency(invoice.amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y divide-border border-y border-border">
          {flags.map((f) => (
            <li key={f} className="flex items-start gap-3 py-2.5">
              <FlagBadge flag={f} className="mt-px" />
              <p className="text-[12.5px] leading-snug text-muted-foreground">{flagMeaning[f]}</p>
            </li>
          ))}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) onApprove(trimmed);
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-[12px] font-medium">Reason for approving</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="e.g. Credit note for the duplicate received from the supplier"
              className="mt-1.5 block w-full resize-none rounded-sm border border-input bg-card px-2.5 py-2 text-[13px] placeholder:text-muted-foreground focus-visible:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <span className="mt-1 block text-[11.5px] text-muted-foreground">
              Kept in the activity log with the approval. You can undo it from the queue.
            </span>
          </label>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmed}>
              Approve with reason
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
