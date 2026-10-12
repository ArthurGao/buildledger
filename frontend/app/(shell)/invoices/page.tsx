"use client";

import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
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
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Invoices"
        description="Captured by EzzyBills, coded to a trade line, approved in ApprovalMax and paid in Xero — the whole run in one ledger. Click any invoice to see what was extracted."
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Invoice figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure
            label="In the pipeline"
            value={String(unpaid.length)}
            source="EzzyBills"
            note={`${formatCompactCurrency(unpaid.reduce((s, i) => s + i.amount, 0))} unpaid`}
          />
          <RuledFigure
            label="Pending approval"
            value={String(pending.length)}
            source="ApprovalMax"
            note={formatCompactCurrency(pending.reduce((s, i) => s + i.amount, 0))}
          />
          <RuledFigure
            label="Flagged"
            value={String(flagged.length)}
            source={["EzzyBills", "Xero"]}
            tone={flagged.length > 0 ? "over" : undefined}
            note="duplicates and no-PO spend"
          />
          <RuledFigure label="Paid this month" value={formatCompactCurrency(paidTotal)} source="Xero" note="settled" />
        </section>

        <section aria-labelledby="run-title">
          <SectionHead
            id="run-title"
            title="The run"
            description="Each stage in order, from capture to payment. The square shows which system owns the stage."
          />
          <PipelineBoard />
        </section>
      </div>
    </div>
  );
}
