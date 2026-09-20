"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { ApprovalQueue } from "@/components/approvals/approval-queue";
import { useDemoState } from "@/lib/demo-state";
import { ageInDays } from "@/lib/derive";
import { formatCompactCurrency } from "@/lib/format";

export default function ApprovalsPage() {
  const { invoices, approvalSteps } = useDemoState();

  const queue = invoices.filter((i) => i.status === "Pending approval");
  const value = queue.reduce((s, i) => s + i.amount, 0);
  const oldest = queue.reduce((max, i) => Math.max(max, ageInDays(i.date)), 0);
  const approvers = new Set(
    approvalSteps.filter((s) => s.status === "Waiting" && queue.some((i) => i.id === s.invoiceId)).map((s) => s.approver)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Everything sitting with an approver right now, with the full chain and how long it has been waiting. Approving here moves the invoice along the pipeline."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Awaiting decision" value={String(queue.length)} sources={["ApprovalMax"]} sub="invoices" />
        <KpiCard label="Value held up" value={formatCompactCurrency(value)} sources={["Xero"]} sub="incl. GST" />
        <KpiCard
          label="Oldest in queue"
          value={`${oldest}d`}
          sources={["ApprovalMax"]}
          tone={oldest >= 7 ? "over" : "neutral"}
          sub="since invoice date"
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
