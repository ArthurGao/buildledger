"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { PipelineBoard } from "@/components/invoices/pipeline-board";
import { useDemoState } from "@/lib/demo-state";
import { formatCompactCurrency } from "@/lib/format";

export default function InvoicesPage() {
  const { invoices } = useDemoState();

  const pending = invoices.filter((i) => i.status === "Pending approval");
  const unpaid = invoices.filter((i) => i.status !== "Paid");
  const flagged = invoices.filter((i) => (i.flags?.length ?? 0) > 0);
  const paidTotal = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Captured by EzzyBills, coded to a trade line, approved in ApprovalMax and paid in Xero — the whole run in one board. Click any invoice to see what was extracted."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="In the pipeline"
          value={String(unpaid.length)}
          sources={["EzzyBills"]}
          sub={`${formatCompactCurrency(unpaid.reduce((s, i) => s + i.amount, 0))} unpaid`}
        />
        <KpiCard
          label="Pending approval"
          value={String(pending.length)}
          sources={["ApprovalMax"]}
          sub={formatCompactCurrency(pending.reduce((s, i) => s + i.amount, 0))}
        />
        <KpiCard
          label="Flagged"
          value={String(flagged.length)}
          sources={["EzzyBills", "Xero"]}
          tone={flagged.length > 0 ? "over" : "neutral"}
          sub="duplicates and no-PO spend"
        />
        <KpiCard label="Paid this month" value={formatCompactCurrency(paidTotal)} sources={["Xero"]} sub="settled" />
      </div>

      <PipelineBoard />
    </div>
  );
}
