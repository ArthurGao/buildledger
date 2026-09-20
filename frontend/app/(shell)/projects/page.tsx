import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { KpiCard } from "@/components/kpi-card";
import { getPortfolioTotals } from "@/lib/derive";
import { formatCompactCurrency, formatPct } from "@/lib/format";
import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  const totals = getPortfolioTotals();
  const atRisk = projects.filter((p) => p.status !== "On track").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Every active job, with the tender budget from CostX reconciled against actual spend in Xero. Open a project for the line-by-line breakdown."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active projects" value={String(projects.length)} sources={["CostX"]} sub="all in delivery" />
        <KpiCard
          label="Committed"
          value={formatCompactCurrency(totals.committed)}
          sources={["ApprovalMax"]}
          sub={`${Math.round((totals.committed / totals.budget) * 100)}% of budget`}
        />
        <KpiCard
          label="Forecast final"
          value={formatCompactCurrency(totals.forecast)}
          sources={["CostX", "Xero"]}
          sub={`against ${formatCompactCurrency(totals.budget)} budget`}
        />
        <KpiCard
          label="Needing attention"
          value={String(atRisk)}
          sources={["Xero"]}
          tone="over"
          sub={`portfolio margin ${formatPct(totals.forecastMarginPct)}`}
        />
      </div>

      <Card>
        <CardContent className="px-1 pt-1">
          <ProjectsTable />
        </CardContent>
      </Card>
    </div>
  );
}
