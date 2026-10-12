import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { ExceptionRow, exceptionCells, exceptionColumns, exceptionLead } from "@/components/exceptions/exception-row";
import { getExceptionCounts, getExceptionExposure, getExceptionGroups } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExceptionItem } from "@/lib/types";

function ExceptionSection({
  id,
  title,
  description,
  items,
}: {
  id: string;
  title: string;
  description: string;
  items: ExceptionItem[];
}) {
  return (
    <section aria-labelledby={id}>
      <SectionHead id={id} title={title} description={description} aside={`${items.length} open`} />
      <div
        aria-hidden="true"
        className={cn(exceptionColumns, "hidden border-b border-border py-2 text-[11.5px] font-medium text-muted-foreground lg:grid")}
      >
        <span className={exceptionLead}>
          <span />
          <span>Exception</span>
        </span>
        <span className={exceptionCells.project}>Project</span>
        <span className={exceptionCells.detected}>Detected from</span>
        <span className={cn(exceptionCells.amount, "text-right")}>Amount</span>
        <span className={exceptionCells.link} />
      </div>
      <ul className="divide-y divide-border">
        {items.map((e) => (
          <ExceptionRow key={e.id} exception={e} />
        ))}
      </ul>
    </section>
  );
}

export default function ExceptionsPage() {
  const groups = getExceptionGroups();
  const counts = getExceptionCounts();
  const exposure = getExceptionExposure();

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Exceptions"
        description="Automatically surfaced from across Xero, CostX and ApprovalMax. Nobody had to export a spreadsheet to find these."
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Exception summary"
          className="grid sm:grid-cols-3 lg:grid-cols-12 [&>*]:border-border max-sm:[&>*+*]:border-t sm:[&>*+*]:border-l lg:[&>*:nth-child(1)]:col-span-5 lg:[&>*:nth-child(2)]:col-span-4 lg:[&>*:nth-child(3)]:col-span-3"
        >
          {/* From lg the three figures split on lines 5 and 9, the same lines as the rows below. */}
          <RuledFigure
            label="Open exceptions"
            value={String(counts.total)}
            note={
              <>
                <span className="font-medium text-over">{counts.high} High</span> ·{" "}
                <span className="font-medium text-warn">{counts.medium} Medium</span>
              </>
            }
          />
          <RuledFigure
            label="Money at stake"
            value={formatCurrency(exposure)}
            source={["Xero", "CostX"]}
            note="Each invoice counted once, however many exceptions cite it"
          />
          <RuledFigure
            label="Statutory"
            value={String(groups.statutory.length)}
            source={["ApprovalMax", "Xero"]}
            note="Raised by working-day clocks and the retention trust ledger"
          />
        </section>

        <ExceptionSection
          id="spend-title"
          title="Spend"
          description="Bills and lines that do not reconcile: duplicates, spend without a purchase order, overruns."
          items={groups.spend}
        />
        <ExceptionSection
          id="statutory-title"
          title="Statutory"
          description="Deadlines and obligations under the Construction Contracts Act and NZS 3910:2023. Not legal advice."
          items={groups.statutory}
        />
      </div>
    </div>
  );
}
