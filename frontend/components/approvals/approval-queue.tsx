"use client";

import * as React from "react";
import { Check, Inbox, Undo2, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FlagBadge } from "@/components/status-badge";
import { SourceBadge } from "@/components/source-badge";
import { ApprovalChain } from "@/components/approvals/approval-chain";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { EmptyState } from "@/components/empty-state";
import { useDemoState } from "@/lib/demo-state";
import { getClockForSource, getProjectName } from "@/lib/derive";
import { ClockBadge } from "@/components/statutory-clock";
import { PaymentScheduleDialog } from "@/components/approvals/payment-schedule-dialog";
import { ApproveFlaggedDialog } from "@/components/approvals/approve-flagged-dialog";
import { AiBadge } from "@/components/ai-badge";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export function ApprovalQueue() {
  const { invoices, approvalSteps, approveInvoice, rejectInvoice, undoDecision, decisions, schedulesIssued } =
    useDemoState();
  const [selected, setSelected] = React.useState<Invoice | null>(null);
  const [open, setOpen] = React.useState(false);
  const [scheduleFor, setScheduleFor] = React.useState<Invoice | null>(null);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [overrideFor, setOverrideFor] = React.useState<Invoice | null>(null);
  const [overrideOpen, setOverrideOpen] = React.useState(false);

  const queue = invoices.filter((i) => i.status === "Pending approval");
  const live = selected ? (invoices.find((i) => i.id === selected.id) ?? null) : null;

  // Only the latest decision per invoice is undoable, so list one line per invoice.
  const recent = decisions.filter((d, i) => decisions.findIndex((x) => x.invoiceId === d.invoiceId) === i);

  if (queue.length === 0 && recent.length === 0) {
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
      {queue.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-muted-foreground md:px-5">Nothing waiting on an approver.</p>
      ) : (
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 md:pl-5">Invoice</TableHead>
              <TableHead className="hidden md:table-cell">Project</TableHead>
              <TableHead className="text-right max-md:pr-4">Amount</TableHead>
              <TableHead className="hidden xl:table-cell">Requested by</TableHead>
              <TableHead className="hidden lg:table-cell">
                <span className="inline-flex items-center gap-1.5">
                  Current approver <SourceBadge system="ApprovalMax" short />
                </span>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <span className="inline-flex items-center gap-1.5">
                  Statutory deadline <SourceBadge system="ApprovalMax" short />
                </span>
              </TableHead>
              <TableHead className="hidden w-[184px] pr-5 text-right md:table-cell">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.map((invoice) => {
              const current = approvalSteps.find((s) => s.invoiceId === invoice.id && s.status === "Waiting");
              const clock = getClockForSource(invoice.id);
              const flagged = (invoice.flags?.length ?? 0) > 0;
              const decision = (
                <div className="flex justify-end gap-1.5 max-md:justify-start">
                  <Button size="sm" variant="outline" onClick={() => rejectInvoice(invoice.id)}>
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  {/* A flagged invoice is never approved in one click: the override asks for a reason. */}
                  {flagged ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOverrideFor(invoice);
                        setOverrideOpen(true);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve…
                    </Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => approveInvoice(invoice.id)}>
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}
                </div>
              );

              return (
                <TableRow key={invoice.id}>
                  <TableCell className="py-3 pl-4 md:pl-5">
                    <div className="flex items-start gap-2.5">
                      {/* A red square marks a flagged or overdue invoice, as on the exceptions list. */}
                      <span
                        aria-hidden="true"
                        className={cn("mt-[5px] h-1.5 w-1.5 shrink-0", flagged || clock?.overdue ? "bg-over" : "bg-transparent")}
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => {
                            setSelected(invoice);
                            setOpen(true);
                          }}
                        >
                          <span className="font-mono text-[12px] font-medium hover:underline">{invoice.invoiceNumber}</span>
                          <span className="block text-[12px] text-muted-foreground">{invoice.supplier}</span>
                        </button>
                        {flagged ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {invoice.flags!.map((f) => (
                              <FlagBadge key={f} flag={f} />
                            ))}
                          </div>
                        ) : null}
                        {/* Below md the project and the clock fold under the invoice. */}
                        <div className="mt-1.5 space-y-1.5 md:hidden">
                          <p className="text-[12px] text-muted-foreground">{getProjectName(invoice.projectId)}</p>
                          {clock && !schedulesIssued.includes(invoice.id) ? <ClockBadge clock={clock} /> : null}
                          {/* Below md the decision sits under the invoice instead of off the right edge. */}
                          <div className="pt-1">{decision}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{getProjectName(invoice.projectId)}</TableCell>
                  <TableCell className="tabular text-right align-top font-medium max-md:pr-4 max-md:pt-3 md:align-middle">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">{invoice.requestedBy}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2.5">
                      <ApprovalChain invoiceId={invoice.id} compact />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{current?.approver ?? "—"}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{current?.role ?? ""}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {schedulesIssued.includes(invoice.id) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-ok-border bg-ok-soft px-2 py-0.5 text-[12px] font-medium text-ok whitespace-nowrap">
                        Payment schedule issued
                      </span>
                    ) : clock ? (
                      <div className="space-y-1.5">
                        <ClockBadge clock={clock} />
                        <button
                          type="button"
                          onClick={() => {
                            setScheduleFor(invoice);
                            setScheduleOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Draft payment schedule
                          <AiBadge label="AI" className="ml-0.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">Not under a statutory clock</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden pr-5 text-right md:table-cell">{decision}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {recent.length > 0 ? (
        <section aria-labelledby="decided-title" className="border-t border-foreground">
          <h3 id="decided-title" className="px-4 pb-1 pt-3 text-[12px] font-semibold md:px-5">
            Decided this session
          </h3>
          <ul className="divide-y divide-border">
            {recent.map((d) => (
              <li key={d.activityId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 md:px-5">
                <p className="min-w-0 text-[12.5px]">
                  <span className="font-mono text-[11.5px]">{d.invoiceNumber}</span>{" "}
                  <span className="font-medium">{d.outcome.toLowerCase()}</span>
                  {d.decidedBy ? <span className="text-muted-foreground"> by {d.decidedBy}</span> : null}
                  {d.reason ? <span className="text-muted-foreground"> — “{d.reason}”</span> : null}
                  {d.progress ? <span className="text-muted-foreground"> · {d.progress}</span> : null}
                </p>
                <Button size="sm" variant="ghost" onClick={() => undoDecision(d.invoiceId)}>
                  <Undo2 className="h-3.5 w-3.5" />
                  Undo
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ApproveFlaggedDialog
        invoice={overrideFor}
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        onApprove={(reason) => {
          if (overrideFor) approveInvoice(overrideFor.id, reason);
          setOverrideOpen(false);
        }}
      />
      <InvoiceDialog invoice={live} open={open} onOpenChange={setOpen} />
      <PaymentScheduleDialog
        invoice={scheduleFor ? (invoices.find((i) => i.id === scheduleFor.id) ?? null) : null}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </>
  );
}
