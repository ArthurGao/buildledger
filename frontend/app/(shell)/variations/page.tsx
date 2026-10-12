import Link from "next/link";
import { ArrowRight, Mail, MessageSquare, ScrollText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { SourceBadge } from "@/components/source-badge";
import { AiBadge } from "@/components/ai-badge";
import { ClockDetail, workingDayNote } from "@/components/statutory-clock";
import {
  getClockForSource,
  getProjectName,
  getUnwrittenVariations,
  getVariationValue,
  getVariations,
} from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateLong } from "@/lib/format";
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

/**
 * One variation as a row of the sheet: what and where on the left, cost and
 * time on the right, then its notification clock and, if the budget baseline
 * is stale, an amber note. No card, no tinted box.
 */
function VariationRow({ variation }: { variation: Variation }) {
  const clock = getClockForSource(variation.id);
  const OriginIcon = originIcon[variation.origin];
  const staleBaseline = variation.status === "Approved" && !variation.writtenBackToBudget;

  return (
    <li className="space-y-3 px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0 flex-1 basis-[20rem] space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Badge variant={statusTone[variation.status]}>{variation.status}</Badge>
            <span className="font-mono text-[11.5px] text-muted-foreground">{variation.costCode}</span>
            <span className="text-[12px] text-muted-foreground">{getProjectName(variation.projectId)}</span>
            {variation.draftedByAi ? <AiBadge label="Drafted from a message" /> : null}
          </div>
          <p className="text-[13px] font-medium">{variation.description}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <OriginIcon className="h-3.5 w-3.5" />
            {variation.origin} · instructed {formatDateLong(variation.instructedOn)}
          </p>
        </div>

        <div className="text-right">
          <p className="tabular text-[15px] font-semibold">
            {variation.costImpact === null ? (
              <span className="text-[13px] font-medium text-muted-foreground">Not priced</span>
            ) : (
              formatCurrency(variation.costImpact)
            )}
          </p>
          <p className="tabular text-[12px] text-muted-foreground">
            {variation.timeImpactDays === null
              ? "Time impact undetermined"
              : variation.timeImpactDays === 0
                ? "No time impact"
                : `+${variation.timeImpactDays} days`}
          </p>
        </div>
      </div>

      {clock ? <ClockDetail clock={clock} note={false} /> : null}

      {staleBaseline ? (
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1 border-t border-border pt-2.5">
          <p className="flex min-w-0 flex-1 basis-[20rem] gap-2 text-[12.5px] leading-snug text-warn">
            <span aria-hidden="true" className="mt-[5px] h-1.5 w-1.5 shrink-0 bg-warn" />
            Approved but not written back to the budget baseline — the reconciliation table is still
            measuring this trade against the original budget.
          </p>
          <Link
            href={`/projects/${variation.projectId}`}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium hover:underline max-sm:ml-3.5"
          >
            Open reconciliation <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </li>
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
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Variations"
        description="Under NZS 3910:2023 an instruction must be notified as a variation within 20 working days or the right to claim it is lost. Cost and time are determined separately."
        action={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="M365" />
            <SourceBadge system="CostX" />
          </div>
        }
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Variation figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure
            label="Open variations"
            value={String(all.filter((v) => v.status !== "Rejected").length)}
            source="CostX"
            note={`${value.unpriced} not yet priced`}
          />
          <RuledFigure
            label="Approved value"
            value={formatCompactCurrency(value.approved)}
            source="CostX"
            note="agreed with the principal"
          />
          <RuledFigure
            label="Notification deadlines missed"
            value={String(overdue)}
            source="M365"
            tone={overdue > 0 ? "over" : undefined}
            note={overdue > 0 ? "already missed" : `${dueSoon} due within 3 working days`}
          />
          {/* A stale baseline is not an overrun, so this figure is never red. */}
          <RuledFigure
            label="Not written back"
            value={String(unwritten.length)}
            source="CostX"
            note="baseline is stale for these trades"
          />
        </section>

        {unwritten.length > 0 ? (
          <section aria-labelledby="baseline-title" className="px-4 py-3.5 md:px-5">
            <h2 id="baseline-title" className="text-[13px] font-semibold">
              Why this matters for the reconciliation
            </h2>
            <p className="mt-0.5 max-w-[72ch] text-[12.5px] leading-snug text-muted-foreground">
              An approved variation that has not been written back to the budget baseline shows up as an
              overrun. The trade is not over budget — the budget is out of date.
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
              {unwritten.map((v) => (
                <span key={v.id} className="inline-flex items-baseline gap-1.5 text-warn">
                  <span className="font-mono text-[11.5px]">{v.costCode}</span>
                  <span className="tabular font-medium">{formatCurrency(v.costImpact ?? 0)}</span>
                </span>
              ))}
            </p>
          </section>
        ) : null}

        <section aria-labelledby="register-title">
          <SectionHead id="register-title" title="Register" aside={`${all.length} variations`} />
          <ul className="divide-y divide-border">
            {all.map((v) => (
              <VariationRow key={v.id} variation={v} />
            ))}
          </ul>
        </section>

        <p className="px-4 py-3 text-[11.5px] text-muted-foreground md:px-5">{workingDayNote}</p>
      </div>
    </div>
  );
}
