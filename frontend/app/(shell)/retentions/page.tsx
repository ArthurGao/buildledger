import { AlertTriangle, Landmark, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { SourceBadge } from "@/components/source-badge";
import {
  getProjectName,
  getRetentionPosition,
  getRetentionReportDue,
  trustAccount,
} from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateLong, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function RetentionsPage() {
  const position = getRetentionPosition();
  const report = getRetentionReportDue();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retentions"
        description="Retention money withheld from subcontractors must sit in a compliant trust account and be reported to each subcontractor every three months. This page reconciles the ledger against the account."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Held on trust"
          value={formatCompactCurrency(position.liability)}
          sources={["Xero"]}
          sub={`across ${position.subcontractorCount} subcontracts`}
        />
        <KpiCard
          label="In the trust account"
          value={formatCompactCurrency(position.held)}
          sources={["Xero"]}
          sub={`reconciled ${formatDateLong(trustAccount.lastReconciled)}`}
        />
        <KpiCard
          label="Shortfall"
          value={position.compliant ? "None" : formatCompactCurrency(position.shortfall)}
          sources={["Xero"]}
          tone={position.compliant ? "neutral" : "over"}
          sub={position.compliant ? "ledger fully backed" : "held is less than the ledger"}
        />
        <KpiCard
          label="Next report due"
          value="30 Sep"
          sources={["ApprovalMax"]}
          sub={`${report.subcontractors} subcontractor reports`}
        />
      </div>

      {!position.compliant ? (
        <Card className="border-over-border bg-over-soft/40">
          <CardContent className="flex flex-wrap items-start gap-4 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-over-soft text-over">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-[280px] flex-1">
              <p className="font-medium text-over">
                The trust account holds {formatCurrency(position.shortfall)} less than the ledger
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Under the Construction Contracts (Retention Money) Amendment Act 2023, retention money
                must be held on trust in a compliant account from the moment it is withheld. Holding
                less than the ledger balance is an offence — up to $200,000 per offence, and up to
                $50,000 for each director.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Figures are illustrative demo data. Confirm the position with your accountant and
                legal adviser.
              </p>
            </div>
            <Button variant="outline" className="shrink-0">
              Transfer to trust account
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Ledger by subcontract</CardTitle>
                <CardDescription>
                  Retention is withheld from each progress claim and released at practical completion
                  and at the end of the defects liability period.
                </CardDescription>
              </div>
              <SourceBadge system="Xero" />
            </div>
          </CardHeader>
          <CardContent className="px-1">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Subcontractor</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Withheld</TableHead>
                  <TableHead className="text-right">Released</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Cap</TableHead>
                  <TableHead className="w-28">Against cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {position.positions.map((p) => {
                  const pctOfCap = Math.min(100, (p.balance / p.cap) * 100);
                  return (
                    <TableRow key={p.contract.id}>
                      <TableCell className="py-3">
                        <span className="font-medium">{p.contract.counterparty}</span>
                        <span className="tabular block text-xs text-muted-foreground">
                          {formatPct(p.contract.retentionPct, 0)} retention · cap{" "}
                          {formatPct(p.contract.retentionCapPct, 0)} of contract
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{getProjectName(p.contract.projectId)}</TableCell>
                      <TableCell className="tabular text-right">{formatCurrency(p.withheld)}</TableCell>
                      <TableCell className="tabular text-right text-muted-foreground">
                        {p.released > 0 ? formatCurrency(p.released) : "—"}
                      </TableCell>
                      <TableCell className="tabular text-right font-medium">
                        {formatCurrency(p.balance)}
                      </TableCell>
                      <TableCell className="tabular text-right text-muted-foreground">
                        {formatCurrency(p.cap)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full", pctOfCap >= 90 ? "bg-warn" : "bg-primary")}
                              style={{ width: `${pctOfCap}%` }}
                            />
                          </div>
                          <span className="tabular w-9 text-right text-xs text-muted-foreground">
                            {Math.round(pctOfCap)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Landmark className="h-4 w-4 text-primary" />
                Trust account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Bank</p>
                <p className="font-medium">{trustAccount.bank}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="font-mono text-xs">{trustAccount.accountNumber}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{trustAccount.accountName}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Bank notified of trust status</span>
                {trustAccount.bankNotified ? (
                  <Badge variant="ok">
                    <ShieldCheck className="h-3 w-3" /> Yes
                  </Badge>
                ) : (
                  <Badge variant="over">Not notified</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Balance</span>
                <span className="tabular font-semibold">{formatCurrency(trustAccount.balance)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quarterly reporting</CardTitle>
              <CardDescription>
                Each subcontractor must receive a report every three months.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Amount retained and the contract it relates to</li>
                <li>Dates retained and the running total</li>
                <li>Trust account details</li>
                <li>Notice of the subcontractor&apos;s right to inspect</li>
              </ul>
              <Button className="w-full">Generate {report.subcontractors} reports</Button>
              <p className="text-xs text-muted-foreground">
                Period ending {formatDateLong(report.quarterEnd)}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
