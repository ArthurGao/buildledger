"use client";

import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { ApprovalQueue } from "@/components/approvals/approval-queue";
import { useDemoState } from "@/lib/demo-state";
import { getClockCounts, getOpenClocks } from "@/lib/derive";
import { formatCompactCurrency } from "@/lib/format";

export default function ApprovalsPage() {
  const { invoices, approvalSteps } = useDemoState();

  const queue = invoices.filter((i) => i.status === "Pending approval");
  const value = queue.reduce((s, i) => s + i.amount, 0);
  const clocks = getClockCounts();
  // Only our own obligations — the other side failing to pay us is a separate thing.
  const worst = getOpenClocks().find((c) => c.exposure === "Ours" && c.overdue);
  const approvers = new Set(
    approvalSteps.filter((s) => s.status === "Waiting" && queue.some((i) => i.id === s.invoiceId)).map((s) => s.approver)
  );

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Approvals"
        description="Everything sitting with an approver right now. The deadline column counts New Zealand working days under the Construction Contracts Act — miss it and the full claimed amount becomes recoverable as a debt."
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Approval figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure label="Awaiting decision" value={String(queue.length)} source="ApprovalMax" note="invoices" />
          <RuledFigure label="Value held up" value={formatCompactCurrency(value)} source="Xero" note="incl. GST" />
          <RuledFigure
            label="Our deadlines missed"
            value={String(clocks.overdue)}
            source="ApprovalMax"
            tone={clocks.overdue > 0 ? "over" : undefined}
            note={
              worst?.overdue
                ? `worst is ${Math.abs(worst.remaining)} working days past due`
                : `${clocks.dueSoon} due within 3 working days`
            }
          />
          <RuledFigure label="Approvers involved" value={String(approvers.size)} source="ApprovalMax" note="across the queue" />
        </section>

        <section aria-labelledby="queue-title">
          <SectionHead
            id="queue-title"
            title="Queue"
            description="Flagged invoices need a reason to approve. Every decision can be undone from the list below the queue."
          />
          <ApprovalQueue />
        </section>
      </div>
    </div>
  );
}
