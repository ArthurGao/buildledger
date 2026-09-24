import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { RecentExceptions } from "@/components/dashboard/recent-exceptions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatutoryPanel } from "@/components/dashboard/statutory-panel";
import { getClockCounts, getPortfolioTotals, getRetentionPosition } from "@/lib/derive";
import { formatCompactCurrency, formatPct } from "@/lib/format";

export default function DashboardPage() {
  const totals = getPortfolioTotals();
  const clocks = getClockCounts();
  const retention = getRetentionPosition();
  const marginDelta = totals.forecastMarginPct - totals.budgetMarginPct;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Portfolio health across all four active projects — tender budgets from CostX reconciled against actual spend in Xero."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total budget"
          value={formatCompactCurrency(totals.budget)}
          sources={["CostX"]}
          sub="across 4 projects"
        />
        <KpiCard
          label="Actual to date"
          value={formatCompactCurrency(totals.actual)}
          sources={["Xero"]}
          sub={`${Math.round((totals.actual / totals.budget) * 100)}% of budget spent`}
        />
        <KpiCard
          label="Forecast margin"
          value={formatPct(totals.forecastMarginPct)}
          sources={["CostX", "Xero"]}
          trend={{
            direction: marginDelta < 0 ? "down" : "up",
            label: `${marginDelta > 0 ? "+" : ""}${marginDelta.toFixed(1)} pts`,
            good: marginDelta >= 0,
          }}
          sub={`from ${formatPct(totals.budgetMarginPct)} at tender`}
        />
        <KpiCard
          label="Statutory exposure"
          value={String(clocks.overdue + (retention.compliant ? 0 : 1))}
          sources={["ApprovalMax", "Xero"]}
          tone="over"
          sub={
            clocks.recoverable > 0
              ? `${clocks.dueSoon} due soon · ${clocks.recoverable} recoverable from others`
              : `${clocks.dueSoon} due within 3 working days`
          }
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Budget vs committed vs actual</CardTitle>
            <CardDescription>
              Tender budget from CostX, purchase orders from ApprovalMax, costs incurred from Xero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <StatutoryPanel />
          <RecentExceptions />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Projects at a glance</CardTitle>
          <CardDescription>Click any row for the line-by-line reconciliation.</CardDescription>
        </CardHeader>
        <CardContent className="px-1">
          <ProjectsTable />
        </CardContent>
      </Card>

      <RecentActivity />
    </div>
  );
}
