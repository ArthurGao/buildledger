"use client";

import { Check, FileText } from "lucide-react";
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
import { AiBadge, AiBoundaryNote } from "@/components/ai-badge";
import { ClockBadge } from "@/components/statutory-clock";
import { useDemoState } from "@/lib/demo-state";
import { draftPaymentSchedule, getClockForSource, getProjectName } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/lib/types";

/**
 * The drafted payment schedule.
 *
 * Under the Construction Contracts Act a schedule that certifies less than was
 * claimed must show how the figure was reached and why it differs. Those
 * reasons are not written here — they are read out of the reconciliation, the
 * purchase order records and the variation register, and each one is shown with
 * the record it came from.
 */
export function PaymentScheduleDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { issuePaymentSchedule, schedulesIssued } = useDemoState();
  if (!invoice) return null;

  const draft = draftPaymentSchedule(invoice);
  const clock = getClockForSource(invoice.id);
  const issued = schedulesIssued.includes(invoice.id);
  const withheld = draft.claimedAmount - draft.scheduledAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <DialogTitle>Payment schedule</DialogTitle>
            <AiBadge />
            {clock ? <ClockBadge clock={clock} /> : null}
          </div>
          <DialogDescription>
            In response to {draft.invoiceNumber} from {draft.supplier} ·{" "}
            {getProjectName(draft.projectId)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <AiBoundaryNote />

          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Claimed</span>
              <span className="tabular text-sm">{formatCurrency(draft.claimedAmount)}</span>
            </div>
            {draft.reasons
              .filter((r) => r.amount > 0)
              .map((r) => (
                <div
                  key={r.kind}
                  className="flex items-start justify-between gap-4 border-t border-border px-4 py-2.5"
                >
                  <span className="text-sm text-muted-foreground">Less — {r.kind.toLowerCase()}</span>
                  <span className="tabular shrink-0 text-sm text-over">−{formatCurrency(r.amount)}</span>
                </div>
              ))}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3">
              <span className="text-sm font-semibold">Scheduled amount</span>
              <span className="tabular text-base font-semibold">
                {formatCurrency(draft.scheduledAmount)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reasons for the difference {withheld > 0 ? `— ${formatCurrency(withheld)}` : ""}
            </p>
            {draft.reasons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                The claim is certified in full. No statement of difference is required.
              </p>
            ) : (
              draft.reasons.map((r) => (
                <div key={r.kind} className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{r.explanation}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3 shrink-0" />
                    {r.evidence}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Read from</span>
                    {r.sources.map((s) => (
                      <SourceBadge key={s} system={s} short />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Review before issuing. A payment schedule is a legal document and the wording is yours,
            not the system&apos;s.
          </p>
        </div>

        <DialogFooter className="gap-2">
          {issued ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ok">
              <Check className="h-4 w-4" /> Issued — the statutory deadline is met
            </span>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Keep editing
              </Button>
              <Button onClick={() => issuePaymentSchedule(invoice.id)}>
                <Check className="h-4 w-4" />
                Issue payment schedule
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
