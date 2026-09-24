import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { SourceBadge } from "@/components/source-badge";
import { ClockBadge } from "@/components/statutory-clock";
import {
  getClaimTotals,
  getClockForSource,
  getContract,
  getProgressClaims,
  getProjectName,
} from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateLong, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClaimStatus, ProgressClaim } from "@/lib/types";

const statusTone: Record<ClaimStatus, "secondary" | "warn" | "ok" | "over" | "default"> = {
  Draft: "secondary",
  Served: "default",
  Scheduled: "warn",
  Paid: "ok",
  Disputed: "over",
};

function ClaimCard({ claim }: { claim: ProgressClaim }) {
  const clock = getClockForSource(claim.id);
  const contract = getContract(claim.contractId);
  const shortPaid =
    claim.scheduledAmount !== undefined && claim.scheduledAmount < claim.netClaimed;

  return (
    <Card className={cn(clock?.overdue && "border-over-border")}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
              Claim {claim.claimNumber} · {getProjectName(claim.projectId)}
              <Badge variant={statusTone[claim.status]}>{claim.status}</Badge>
            </CardTitle>
            <CardDescription>
              {contract?.counterparty} · period ending {formatDateLong(claim.periodEnd)}
              {claim.servedOn ? ` · served ${formatDateLong(claim.servedOn)}` : " · not yet served"}
            </CardDescription>
          </div>
          {clock ? <ClockBadge clock={clock} /> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20">Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">
                <span className="inline-flex items-center gap-1.5">
                  Contract value <SourceBadge system="CostX" short />
                </span>
              </TableHead>
              <TableHead className="text-right">Complete</TableHead>
              <TableHead className="text-right">Previously claimed</TableHead>
              <TableHead className="text-right">This claim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claim.lines.map((l) => (
              <TableRow key={l.costCode}>
                <TableCell className="tabular font-mono text-xs text-muted-foreground">
                  {l.costCode}
                </TableCell>
                <TableCell className="font-medium">{l.description}</TableCell>
                <TableCell className="tabular text-right">{formatCurrency(l.contractValue)}</TableCell>
                <TableCell className="tabular text-right">
                  <span className="text-muted-foreground">{formatPct(l.percentComplete, 0)}</span>
                </TableCell>
                <TableCell className="tabular text-right text-muted-foreground">
                  {formatCurrency(l.previouslyClaimed)}
                </TableCell>
                <TableCell className="tabular text-right font-medium">
                  {formatCurrency(l.thisClaim)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="font-semibold">
                Gross claimed
              </TableCell>
              <TableCell className="tabular text-right font-semibold">
                {formatCurrency(claim.grossClaimed)}
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="text-muted-foreground">
                Less retention at {formatPct(contract?.retentionPct ?? 0, 0)}
              </TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                −{formatCurrency(claim.retentionWithheld)}
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="font-semibold">
                Net claimed
              </TableCell>
              <TableCell className="tabular text-right font-semibold">
                {formatCurrency(claim.netClaimed)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {shortPaid ? (
          <div className="mx-4 rounded-md border border-warn-border bg-warn-soft/60 p-3 text-sm">
            <p className="font-medium text-warn">
              Scheduled at {formatCurrency(claim.scheduledAmount ?? 0)} — {" "}
              {formatCurrency(claim.netClaimed - (claim.scheduledAmount ?? 0))} less than claimed
            </p>
            <p className="mt-1 text-muted-foreground">
              A payment schedule that reduces the amount must state how it was calculated and why it
              differs. Review the reasons before the payment date.
            </p>
          </div>
        ) : null}

        <p className="px-4 pb-1 text-xs text-muted-foreground">
          Line values come from the CostX schedule of values — the same data as the budget
          reconciliation. Percentage complete is certified by the project team, not calculated.
        </p>
      </CardContent>
    </Card>
  );
}

export default function ClaimsPage() {
  const claims = getProgressClaims();
  const totals = getClaimTotals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress claims"
        description="Claims to principals, built from the same cost code breakdown as the budget reconciliation. Retention is withheld here and tracked on the Retentions page."
        actions={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="CostX" />
            <SourceBadge system="Xero" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Outstanding"
          value={formatCompactCurrency(totals.outstandingValue)}
          sources={["Xero"]}
          sub={`${totals.outstandingCount} claims awaiting payment`}
        />
        <KpiCard
          label="In draft"
          value={formatCompactCurrency(totals.draftValue)}
          sources={["CostX"]}
          sub="not yet served"
        />
        <KpiCard
          label="Retention withheld"
          value={formatCompactCurrency(totals.retentionThisRound)}
          sources={["Xero"]}
          sub="across all claims shown"
        />
        <KpiCard
          label="Claims this period"
          value={String(claims.length)}
          sources={["CostX"]}
          sub="across 4 projects"
        />
      </div>

      <div className="space-y-4">
        {claims.map((c) => (
          <ClaimCard key={c.id} claim={c} />
        ))}
      </div>
    </div>
  );
}
