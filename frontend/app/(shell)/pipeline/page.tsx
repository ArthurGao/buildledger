import { Mail, MessageSquare, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { SourceBadge } from "@/components/source-badge";
import { ConfidenceBar } from "@/components/inbox/class-badge";
import { AiBadge } from "@/components/ai-badge";
import { getOpportunities, getPipelineValue } from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Opportunity, OpportunityStatus } from "@/lib/types";

const STAGES: OpportunityStatus[] = ["Lead", "Opportunity", "Bid", "Submitted", "Won"];

const sourceIcon = { Email: Mail, "Meeting minutes": Users, Chat: MessageSquare } as const;

/**
 * Columns shared by every opportunity row. From lg they are the sheet's 12
 * lines: opportunity 1-4 · extracted from 5-6 · closes 7-8 · value 9-10 ·
 * confirmation 11-12.
 */
const columns = "grid grid-cols-[0.375rem_minmax(0,1fr)_auto] gap-x-3 px-4 md:px-5 lg:grid-cols-12 lg:gap-x-0 lg:px-0";
const cells = {
  lead: "contents lg:col-span-4 lg:grid lg:grid-cols-[0.375rem_minmax(0,1fr)] lg:gap-x-3 lg:pl-5 lg:pr-3",
  extracted: "hidden lg:col-span-2 lg:block lg:pr-3",
  closes: "hidden lg:col-span-2 lg:block lg:pr-3",
  value: "lg:col-span-2 lg:pr-3",
  confirm: "col-start-2 lg:col-span-2 lg:col-start-auto lg:pr-5 lg:text-right",
};

function OpportunityRow({ opportunity }: { opportunity: Opportunity }) {
  const Icon = sourceIcon[opportunity.extractedFrom];

  return (
    <li className={cn(columns, "items-start gap-y-2 py-2.5")}>
      <div className={cells.lead}>
        {/* Amber marks fields a person has not yet checked. */}
        <span
          aria-hidden="true"
          className={cn("mt-[6px] h-1.5 w-1.5", opportunity.confirmed ? "bg-transparent" : "bg-warn")}
        />
        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-snug">{opportunity.name}</p>
          <p className="truncate text-[12px] text-muted-foreground">{opportunity.principal}</p>
          {/* Below lg the extraction and closing date fold under the name. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground lg:hidden">
            <span className="inline-flex items-center gap-1">
              <Icon aria-hidden="true" className="h-3 w-3" />
              {opportunity.extractedFrom}
            </span>
            <AiBadge label="Extracted" confidence={opportunity.confidence} />
            {opportunity.closesOn ? <span className="tabular">Closes {formatDateLong(opportunity.closesOn)}</span> : null}
          </p>
        </div>
      </div>

      <div className={cn(cells.extracted, "space-y-1.5")}>
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />
          {opportunity.extractedFrom}
        </p>
        <AiBadge label="Extracted" confidence={opportunity.confidence} />
        <ConfidenceBar value={opportunity.confidence} className="w-24" />
      </div>

      <p className={cn(cells.closes, "tabular text-[12.5px] text-muted-foreground")}>
        {opportunity.closesOn ? formatDateLong(opportunity.closesOn) : "—"}
      </p>

      <p className={cn(cells.value, "tabular text-right text-[13px] font-medium")}>
        {opportunity.estimatedValue === null ? (
          <span className="text-[12px] font-normal text-muted-foreground">Value unknown</span>
        ) : (
          formatCurrency(opportunity.estimatedValue)
        )}
      </p>

      <div className={cells.confirm}>
        {opportunity.confirmed ? (
          <Badge variant="ok">Confirmed</Badge>
        ) : (
          <Button size="sm" variant="outline" className="h-7 text-[12px]">
            Confirm fields
          </Button>
        )}
      </div>
    </li>
  );
}

export default function PipelinePage() {
  const all = getOpportunities();
  const pipeline = getPipelineValue();

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Pipeline"
        description="Opportunities pulled out of email, meeting minutes and chat. The assistant drafts the fields; nothing enters the pipeline until a person confirms them."
        action={<SourceBadge system="M365" />}
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Pipeline figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure label="Live opportunities" value={String(pipeline.count)} source="M365" note="not lost or declined" />
          <RuledFigure label="Pipeline value" value={formatCompactCurrency(pipeline.value)} source="CostX" note="estimated, pre-tender" />
          {/* Unchecked fields are pending, not an overrun, so this figure is never red. */}
          <RuledFigure
            label="Awaiting confirmation"
            value={String(pipeline.unconfirmed)}
            source="M365"
            note="extracted fields not yet checked"
          />
          <RuledFigure
            label="Closing this month"
            value={String(all.filter((o) => o.closesOn && o.closesOn <= "2026-09-30").length)}
            source="M365"
            note="tender deadlines"
          />
        </section>

        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-3 text-[12.5px] md:px-5">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="font-medium">The assistant reads, a person decides.</span>
          <span className="text-muted-foreground">
            Fields are extracted with a confidence score. Low confidence is surfaced, never silently accepted, and no
            opportunity reaches estimating unconfirmed.
          </span>
        </p>

        <section aria-labelledby="tender-title">
          <SectionHead id="tender-title" title="Tender pipeline" description="Lead through to award." />
          <div className="divide-y divide-border">
            {STAGES.map((stage) => {
              const items = all.filter((o) => o.status === stage);
              const total = items.reduce((s, o) => s + (o.estimatedValue ?? 0), 0);
              const id = `stage-${stage.toLowerCase()}`;
              return (
                <section key={stage} aria-labelledby={id}>
                  <header className="flex items-baseline gap-2 bg-foreground/[0.02] px-4 py-2 md:px-5">
                    <h3 id={id} className="text-[12px] font-semibold">
                      {stage}
                    </h3>
                    <span className="tabular text-[12px] text-muted-foreground">{items.length}</span>
                    <span className="tabular ml-auto text-[12px] font-medium">
                      {total > 0 ? formatCompactCurrency(total) : "—"}
                    </span>
                  </header>
                  {items.length === 0 ? (
                    <p className="border-t border-border px-4 py-2.5 text-[12px] text-muted-foreground md:px-5">Nothing here</p>
                  ) : (
                    <ul className="divide-y divide-border border-t border-border">
                      {items.map((o) => (
                        <OpportunityRow key={o.id} opportunity={o} />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
