import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { getPortfolioLedger, getPortfolioTotals } from "@/lib/derive";
import { formatCompactCurrency, formatPct, formatSignedCurrency } from "@/lib/format";
import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  const totals = getPortfolioTotals();
  const atRisk = projects.filter((p) => p.status !== "On track").length;
  const over = getPortfolioLedger().filter((p) => p.over).length;
  const variance = totals.forecast - totals.budget;

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Projects"
        description="Every active job, with the tender budget from CostX reconciled against actual spend in Xero. Open a project for the line-by-line breakdown."
      />

      <div className="divide-y divide-border border border-border bg-card">
        {/* Four ruled figures on the 3 | 6 | 9 lines, not four cards. */}
        <section
          aria-label="Portfolio figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure
            label="Active projects"
            value={String(projects.length)}
            source="CostX"
            note="all in delivery"
          />
          <RuledFigure
            label="Committed"
            value={formatCompactCurrency(totals.committed)}
            source="ApprovalMax"
            note={`${Math.round((totals.committed / totals.budget) * 100)}% of budget on purchase orders`}
          />
          <RuledFigure
            label="Forecast final"
            value={formatCompactCurrency(totals.forecast)}
            source={["CostX", "Xero"]}
            tone={variance > 0 ? "over" : undefined}
            note={`${formatSignedCurrency(variance)} against ${formatCompactCurrency(totals.budget)} budget`}
          />
          <RuledFigure
            label="Needing attention"
            value={String(atRisk)}
            source="Xero"
            tone={atRisk > 0 ? "over" : undefined}
            note={`${over} forecast over · portfolio margin ${formatPct(totals.forecastMarginPct)}`}
          />
        </section>

        <section aria-labelledby="projects-title">
          <SectionHead
            id="projects-title"
            title="All projects"
            description="Forecast at completion against budget, largest overrun relative to budget first. Committed is purchase orders raised in ApprovalMax."
          />
          <ProjectsTable variant="full" />
        </section>
      </div>
    </div>
  );
}
