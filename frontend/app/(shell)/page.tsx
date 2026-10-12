import Link from "next/link";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { SourceBadge } from "@/components/source-badge";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { RecentExceptions } from "@/components/dashboard/recent-exceptions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatutoryPanel } from "@/components/dashboard/statutory-panel";
import { getClockCounts, getPortfolioLedger, getPortfolioTotals, getRetentionPosition } from "@/lib/derive";
import { formatCompactCurrency, formatPct, formatSignedCurrency, formatSignedPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const totals = getPortfolioTotals();
  const clocks = getClockCounts();
  const retention = getRetentionPosition();
  const ledger = getPortfolioLedger();
  const overruns = ledger.filter((p) => p.over);
  const [lead, ...others] = overruns;
  const marginDelta = totals.forecastMarginPct - totals.budgetMarginPct;
  const exposure = clocks.overdue + (retention.compliant ? 0 : 1);

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Dashboard"
        meta={[
          `${ledger.length} active projects`,
          <span key="sources" className="inline-flex flex-wrap items-center gap-1">
            Budgets <SourceBadge system="CostX" short /> · commitments <SourceBadge system="ApprovalMax" short /> ·
            actuals <SourceBadge system="Xero" short />
          </span>,
        ]}
        description="Portfolio health across all four active projects — tender budgets from CostX reconciled against actual spend in Xero."
      />

      {/* One ruled sheet: the overrun, the portfolio, and what needs action are
          sections of the same page. */}
      <div className="divide-y divide-border border border-border bg-card">
        <section aria-labelledby="lead-title" className="min-w-0 px-4 pb-5 pt-4 md:px-5">
          <h2 id="lead-title" className="text-[12px] font-medium text-muted-foreground">
            {overruns.length === 0
              ? "Forecast at completion against budget"
              : `${overruns.length} of ${ledger.length} projects forecast over budget at completion`}
          </h2>

          {lead ? (
            <>
              {/* The answer to "which job is losing money" is set larger than the job's name. */}
              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
                <p className="tabular text-[34px] font-semibold leading-none tracking-[-0.02em] text-over sm:text-[42px]">
                  {formatSignedCurrency(lead.variance)}
                </p>
                <p className="pb-1 text-[13px] leading-snug text-muted-foreground">
                  <Link
                    href={`/projects/${lead.id}`}
                    className="font-semibold text-foreground underline-offset-2 hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <span className="ml-1.5 font-mono text-[11px]">{lead.id}</span>
                  <br />
                  <span className="tabular font-semibold text-over">{formatSignedPct(lead.variancePct)}</span> over budget
                  at completion, the largest overrun relative to its budget
                </p>
              </div>
              {others.length > 0 ? (
                <p className="mt-3 text-[12.5px] text-muted-foreground">
                  Also over:{" "}
                  {others.map((o, i) => (
                    <span key={o.id}>
                      {i > 0 ? ", " : null}
                      <Link href={`/projects/${o.id}`} className="font-medium text-foreground hover:underline">
                        {o.name}
                      </Link>{" "}
                      <span className="tabular text-over">
                        {formatSignedCurrency(o.variance)} · {formatSignedPct(o.variancePct)}
                      </span>
                    </span>
                  ))}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.02em] sm:text-[42px]">
              No project forecast over budget
            </p>
          )}

          <p className="mt-3 flex flex-wrap items-center gap-1 text-[11.5px] text-muted-foreground">
            Project managers&rsquo; forecasts, built from
            <SourceBadge system="CostX" short />
            <SourceBadge system="ApprovalMax" short />
            <SourceBadge system="Xero" short />
          </p>
        </section>

        {/* Four ruled figures on the 3 | 6 | 9 lines, under the answer they support. */}
        <section
          aria-label="Portfolio figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure
            label="Total budget"
            value={formatCompactCurrency(totals.budget)}
            source="CostX"
            note={`across ${ledger.length} projects`}
          />
          <RuledFigure
            label="Actual to date"
            value={formatCompactCurrency(totals.actual)}
            source="Xero"
            note={`${Math.round((totals.actual / totals.budget) * 100)}% of budget spent`}
          />
          <RuledFigure
            label="Forecast margin"
            value={formatPct(totals.forecastMarginPct)}
            source={["CostX", "Xero"]}
            tone={marginDelta < 0 ? "over" : undefined}
            note={
              <>
                <span className={cn("tabular font-medium", marginDelta < 0 ? "text-over" : "text-foreground")}>
                  {marginDelta > 0 ? "+" : marginDelta < 0 ? "-" : ""}
                  {Math.abs(marginDelta).toFixed(1)} pts
                </span>{" "}
                from {formatPct(totals.budgetMarginPct)} at tender
              </>
            }
          />
          <RuledFigure
            label="Statutory exposure"
            value={String(exposure)}
            source={["ApprovalMax", "Xero"]}
            tone={exposure > 0 ? "over" : undefined}
            note={
              clocks.recoverable > 0
                ? `${clocks.dueSoon} due soon · ${clocks.recoverable} recoverable`
                : `${clocks.dueSoon} due within 3 working days`
            }
          />
        </section>

        <section aria-labelledby="portfolio-title">
          <SectionHead
            id="portfolio-title"
            title="Projects"
            description="Forecast at completion against budget, largest overrun relative to budget first. Open a project for its line-by-line reconciliation."
            aside={
              <Link href="/projects" className="hover:text-foreground hover:underline">
                All projects
              </Link>
            }
          />
          <ProjectsTable variant="compact" />
        </section>

        {/* The 8 line again: exceptions | statutory deadlines. */}
        <div className="grid lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <RecentExceptions />
          </div>
          <div className="min-w-0 border-t border-border lg:col-span-4 lg:border-l lg:border-t-0">
            <StatutoryPanel />
          </div>
        </div>

        <RecentActivity />
      </div>
    </div>
  );
}
