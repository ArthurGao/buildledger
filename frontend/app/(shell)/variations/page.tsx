import Link from "next/link";
import { ArrowRight, Mail, MessageSquare, ScrollText, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { SourceBadge } from "@/components/source-badge";
import { AiBadge } from "@/components/ai-badge";
import { ClockDetail } from "@/components/statutory-clock";
import {
  getClockForSource,
  getProjectName,
  getUnwrittenVariations,
  getVariationValue,
  getVariations,
} from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Variation, VariationStatus } from "@/lib/types";

const originIcon = {
  Email: Mail,
  Meeting: Users,
  "Site instruction": ScrollText,
  Chat: MessageSquare,
} as const;

const statusTone: Record<VariationStatus, "secondary" | "warn" | "ok" | "over"> = {
  Identified: "warn",
  Notified: "secondary",
  Priced: "secondary",
  Approved: "ok",
  Rejected: "over",
};

function VariationCard({ variation }: { variation: Variation }) {
  const clock = getClockForSource(variation.id);
  const OriginIcon = originIcon[variation.origin];
  const staleBaseline = variation.status === "Approved" && !variation.writtenBackToBudget;

  return (
    <Card className={cn(clock?.overdue && "border-over-border")}>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[240px] flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusTone[variation.status]}>{variation.status}</Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                {variation.costCode}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getProjectName(variation.projectId)}
              </span>
              {variation.draftedByAi ? <AiBadge label="Drafted from a message" /> : null}
            </div>
            <p className="text-sm font-medium">{variation.description}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <OriginIcon className="h-3.5 w-3.5" />
              {variation.origin} · instructed {formatDateLong(variation.instructedOn)}
            </p>
          </div>

          <div className="space-y-1 text-right">
            <p className="tabular text-lg font-semibold">
              {variation.costImpact === null ? (
                <span className="text-muted-foreground">Not priced</span>
              ) : (
                formatCurrency(variation.costImpact)
              )}
            </p>
            <p className="tabular text-xs text-muted-foreground">
              {variation.timeImpactDays === null
                ? "Time impact undetermined"
                : variation.timeImpactDays === 0
                  ? "No time impact"
                  : `+${variation.timeImpactDays} days`}
            </p>
          </div>
        </div>

        {clock ? <ClockDetail clock={clock} /> : null}

        {staleBaseline ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-warn-border bg-warn-soft/60 p-3">
            <p className="min-w-[240px] flex-1 text-sm text-warn">
              Approved but not written back to the budget baseline — the reconciliation table is still
              measuring this trade against the original budget.
            </p>
            <Link
              href={`/projects/${variation.projectId}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Open reconciliation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function VariationsPage() {
  const all = getVariations();
  const value = getVariationValue();
  const unwritten = getUnwrittenVariations();
  const clocked = all.map((v) => getClockForSource(v.id)).filter(Boolean);
  const overdue = clocked.filter((c) => c?.overdue && c.exposure === "Ours").length;
  const dueSoon = clocked.filter((c) => c && !c.overdue && c.remaining <= 3).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Variations"
        description="Under NZS 3910:2023 an instruction must be notified as a variation within 20 working days or the right to claim it is lost. Cost and time are determined separately."
        actions={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="M365" />
            <SourceBadge system="CostX" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Open variations"
          value={String(all.filter((v) => v.status !== "Rejected").length)}
          sources={["CostX"]}
          sub={`${value.unpriced} not yet priced`}
        />
        <KpiCard
          label="Approved value"
          value={formatCompactCurrency(value.approved)}
          sources={["CostX"]}
          sub="agreed with the principal"
        />
        <KpiCard
          label="Notification deadlines"
          value={String(overdue)}
          sources={["M365"]}
          tone={overdue > 0 ? "over" : "neutral"}
          sub={overdue > 0 ? "already missed" : `${dueSoon} due within 3 working days`}
        />
        <KpiCard
          label="Not written back"
          value={String(unwritten.length)}
          sources={["CostX"]}
          tone={unwritten.length > 0 ? "over" : "neutral"}
          sub="baseline is stale for these trades"
        />
      </div>

      {unwritten.length > 0 ? (
        <Card className="bg-gradient-to-br from-warn-soft/60 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Why this matters for the reconciliation</CardTitle>
            <CardDescription>
              An approved variation that has not been written back to the budget baseline shows up as
              an overrun. The trade is not over budget — the budget is out of date.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-1">
            {unwritten.map((v) => (
              <Badge key={v.id} variant="warn" className="font-mono">
                {v.costCode} · {formatCurrency(v.costImpact ?? 0)}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {all.map((v) => (
          <VariationCard key={v.id} variation={v} />
        ))}
      </div>
    </div>
  );
}
