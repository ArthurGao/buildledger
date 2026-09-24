"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
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
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Everything sitting with an approver right now. The deadline column counts New Zealand working days under the Construction Contracts Act — miss it and the full claimed amount becomes recoverable as a debt."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Awaiting decision" value={String(queue.length)} sources={["ApprovalMax"]} sub="invoices" />
        <KpiCard label="Value held up" value={formatCompactCurrency(value)} sources={["Xero"]} sub="incl. GST" />
        <KpiCard
          label="Our deadlines missed"
          value={String(clocks.overdue)}
          sources={["ApprovalMax"]}
          tone={clocks.overdue > 0 ? "over" : "neutral"}
          sub={
            worst?.overdue
              ? `worst is ${Math.abs(worst.remaining)} working days past due`
              : `${clocks.dueSoon} due within 3 working days`
          }
        />
        <KpiCard label="Approvers involved" value={String(approvers.size)} sources={["ApprovalMax"]} sub="across the queue" />
      </div>

      <Card>
        <CardContent className="px-1 pt-1">
          <ApprovalQueue />
        </CardContent>
      </Card>
    </div>
  );
}
