import { Mail, MessageSquare, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { SourceBadge } from "@/components/source-badge";
import { ConfidenceBar } from "@/components/inbox/class-badge";
import { getOpportunities, getPipelineValue } from "@/lib/derive";
import { formatCompactCurrency, formatConfidence, formatCurrency, formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Opportunity, OpportunityStatus } from "@/lib/types";

const STAGES: OpportunityStatus[] = ["Lead", "Opportunity", "Bid", "Submitted", "Won"];

const sourceIcon = { Email: Mail, "Meeting minutes": Users, Chat: MessageSquare } as const;

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const Icon = sourceIcon[opportunity.extractedFrom];

  return (
    <div
      className={cn(
        "rounded-md border bg-card p-3 shadow-card",
        opportunity.confirmed ? "border-border" : "border-warn-border"
      )}
    >
      <p className="text-sm font-medium leading-snug">{opportunity.name}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{opportunity.principal}</p>

      <p className="tabular mt-2 text-base font-semibold">
        {opportunity.estimatedValue === null ? (
          <span className="text-sm text-muted-foreground">Value unknown</span>
        ) : (
          formatCurrency(opportunity.estimatedValue)
        )}
      </p>

      {opportunity.closesOn ? (
        <p className="tabular mt-0.5 text-[11px] text-muted-foreground">
          Closes {formatDateLong(opportunity.closesOn)}
        </p>
      ) : null}

      <div className="mt-3 space-y-1.5 border-t border-border pt-2.5">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Icon className="h-3 w-3 shrink-0" />
          Extracted from {opportunity.extractedFrom.toLowerCase()}
        </p>
        <div className="flex items-center gap-2">
          <ConfidenceBar value={opportunity.confidence} className="flex-1" />
          <span className="tabular text-[11px] text-muted-foreground">
            {formatConfidence(opportunity.confidence)}
          </span>
        </div>
        {opportunity.confirmed ? (
          <Badge variant="ok" className="mt-1">Confirmed</Badge>
        ) : (
          <Button size="sm" variant="outline" className="mt-1 h-7 w-full text-xs">
            Confirm fields
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const all = getOpportunities();
  const pipeline = getPipelineValue();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Opportunities pulled out of email, meeting minutes and chat. The assistant drafts the fields; nothing enters the pipeline until a person confirms them."
        actions={<SourceBadge system="M365" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Live opportunities" value={String(pipeline.count)} sources={["M365"]} sub="not lost or declined" />
        <KpiCard label="Pipeline value" value={formatCompactCurrency(pipeline.value)} sources={["CostX"]} sub="estimated, pre-tender" />
        <KpiCard
          label="Awaiting confirmation"
          value={String(pipeline.unconfirmed)}
          sources={["M365"]}
          tone={pipeline.unconfirmed > 0 ? "over" : "neutral"}
          sub="extracted fields not yet checked"
        />
        <KpiCard label="Closing this month" value={String(all.filter((o) => o.closesOn && o.closesOn <= "2026-09-30").length)} sources={["M365"]} sub="tender deadlines" />
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-wrap items-center gap-x-2.5 gap-y-2 p-5 text-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-medium">The assistant reads, a person decides.</span>
          <span className="text-muted-foreground">
            Fields are extracted with a confidence score. Low confidence is surfaced, never silently
            accepted, and no opportunity reaches estimating unconfirmed.
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tender pipeline</CardTitle>
          <CardDescription>Lead through to award.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {STAGES.map((stage) => {
              const items = all.filter((o) => o.status === stage);
              const total = items.reduce((s, o) => s + (o.estimatedValue ?? 0), 0);
              return (
                <section key={stage} className="flex min-w-0 flex-col rounded-lg bg-muted/50 p-2.5">
                  <header className="mb-2.5 px-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="truncate text-xs font-semibold">{stage}</h2>
                      <span className="tabular ml-auto rounded bg-card px-1.5 text-[11px] font-medium text-muted-foreground">
                        {items.length}
                      </span>
                    </div>
                    <p className="tabular mt-1 text-[11px] text-muted-foreground">
                      {total > 0 ? formatCompactCurrency(total) : "—"}
                    </p>
                  </header>
                  <div className="flex flex-col gap-2">
                    {items.length === 0 ? (
                      <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-[11px] text-muted-foreground">
                        Nothing here
                      </p>
                    ) : (
                      items.map((o) => <OpportunityCard key={o.id} opportunity={o} />)
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
