import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { SourceBadge } from "@/components/source-badge";
import {
  getProjectName,
  getRetentionPosition,
  getRetentionReportDue,
  trustAccount,
} from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateLong, formatDateShort, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The sheet's margins on the first and last cells of every row. */
const first = "pl-4 md:pl-5";
const last = "pr-4 md:pr-5";

export default function RetentionsPage() {
  const position = getRetentionPosition();
  const report = getRetentionReportDue();

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Retentions"
        description="Retention money withheld from subcontractors must sit in a compliant trust account and be reported to each subcontractor every three months. This page reconciles the ledger against the account."
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Retention figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure
            label="Held on trust"
            value={formatCompactCurrency(position.liability)}
            source="Xero"
            note={`across ${position.subcontractorCount} subcontracts`}
          />
          <RuledFigure
            label="In the trust account"
            value={formatCompactCurrency(position.held)}
            source="Xero"
            note={`reconciled ${formatDateLong(trustAccount.lastReconciled)}`}
          />
          {/* The shortfall is a legal figure, so it is shown to the dollar, the same as in the notice below. */}
          <RuledFigure
            label="Shortfall"
            value={position.compliant ? "None" : formatCurrency(position.shortfall)}
            source="Xero"
            tone={position.compliant ? undefined : "over"}
            note={position.compliant ? "ledger fully backed" : "held is less than the ledger"}
          />
          <RuledFigure
            label="Next report due"
            value={formatDateShort(report.quarterEnd)}
            source="Xero"
            note={`${report.subcontractors} subcontractor reports`}
          />
        </section>

        {!position.compliant ? (
          <section aria-labelledby="shortfall-title" className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-4 md:px-5">
            <div className="flex min-w-0 flex-1 basis-[28rem] gap-3">
              <span aria-hidden="true" className="mt-[6px] h-2 w-2 shrink-0 bg-over" />
              <div className="min-w-0">
                <h2 id="shortfall-title" className="text-[13px] font-semibold text-over">
                  The trust account holds {formatCurrency(position.shortfall)} less than the ledger
                </h2>
                <p className="mt-1 max-w-[72ch] text-[12.5px] leading-snug text-muted-foreground">
                  Under the Construction Contracts (Retention Money) Amendment Act 2023, retention money
                  must be held on trust in a compliant account from the moment it is withheld. Holding
                  less than the ledger balance is an offence — up to $200,000 per offence, and up to
                  $50,000 for each director.
                </p>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                  Figures are illustrative demo data. Confirm the position with your accountant and
                  legal adviser.
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0 max-sm:ml-5">
              Transfer to trust account
            </Button>
          </section>
        ) : null}

        {/* The 8 line: the ledger | the account it must be backed by. */}
        <div className="grid lg:grid-cols-12">
          <section aria-labelledby="ledger-title" className="min-w-0 lg:col-span-8">
            <SectionHead
              id="ledger-title"
              title="Ledger by subcontract"
              description="Retention is withheld from each progress claim and released at practical completion and at the end of the defects liability period."
            />
            <Table className="text-[13px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={first}>Subcontractor</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Withheld</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Released</TableHead>
                  <TableHead className="text-right max-md:pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      Balance <SourceBadge system="Xero" short />
                    </span>
                  </TableHead>
                  <TableHead className="hidden text-right md:table-cell">Cap</TableHead>
                  <TableHead className={cn("hidden w-28 md:table-cell", last)}>Against cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {position.positions.map((p) => {
                  const pctOfCap = Math.min(100, (p.balance / p.cap) * 100);
                  return (
                    <TableRow key={p.contract.id}>
                      <TableCell className={cn("py-2.5", first)}>
                        <span className="font-medium">{p.contract.counterparty}</span>
                        <span className="tabular block text-[12px] text-muted-foreground">
                          {formatPct(p.contract.retentionPct, 0)} retention · cap{" "}
                          {formatPct(p.contract.retentionCapPct, 0)} of contract
                        </span>
                        <span className="block text-[12px] text-muted-foreground">{getProjectName(p.contract.projectId)}</span>
                      </TableCell>
                      <TableCell className="tabular hidden text-right sm:table-cell">{formatCurrency(p.withheld)}</TableCell>
                      <TableCell className="tabular hidden text-right text-muted-foreground md:table-cell">
                        {p.released > 0 ? formatCurrency(p.released) : "—"}
                      </TableCell>
                      <TableCell className="tabular text-right font-medium max-md:pr-4">{formatCurrency(p.balance)}</TableCell>
                      <TableCell className="tabular hidden text-right text-muted-foreground md:table-cell">
                        {formatCurrency(p.cap)}
                      </TableCell>
                      <TableCell className={cn("hidden md:table-cell", last)}>
                        {/* The spent-meter idiom: the figure over a 3px square-ended bar. */}
                        <span className="flex flex-col gap-1">
                          <span className="tabular text-right text-[11.5px] leading-none text-muted-foreground">
                            {Math.round(pctOfCap)}%
                          </span>
                          <span className="relative h-[3px] bg-foreground/10" aria-hidden="true">
                            <span
                              className={cn("absolute inset-y-0 left-0", pctOfCap >= 90 ? "bg-warn" : "bg-foreground/60")}
                              style={{ width: `${pctOfCap}%` }}
                            />
                          </span>
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>

          <div className="min-w-0 divide-y divide-border border-t border-border lg:col-span-4 lg:border-l lg:border-t-0">
            <section aria-labelledby="trust-title">
              <SectionHead id="trust-title" title="Trust account" aside={<SourceBadge system="Xero" short />} />
              <dl className="divide-y divide-border text-[13px]">
                <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 md:px-5">
                  <dt className="text-[12px] text-muted-foreground">Bank</dt>
                  <dd className="font-medium">{trustAccount.bank}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 md:px-5">
                  <dt className="text-[12px] text-muted-foreground">Account</dt>
                  <dd className="min-w-0 text-right">
                    <span className="block font-mono text-[11.5px]">{trustAccount.accountNumber}</span>
                    <span className="block text-[12px] text-muted-foreground">{trustAccount.accountName}</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-5">
                  <dt className="text-[12px] text-muted-foreground">Bank notified of trust status</dt>
                  <dd>
                    {trustAccount.bankNotified ? (
                      <Badge variant="ok">
                        <ShieldCheck className="h-3 w-3" /> Yes
                      </Badge>
                    ) : (
                      <Badge variant="over">Not notified</Badge>
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-foreground px-4 py-2.5 md:px-5">
                  <dt className="font-semibold">Balance</dt>
                  <dd className="tabular font-semibold">{formatCurrency(trustAccount.balance)}</dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="reporting-title" className="pb-4">
              <SectionHead
                id="reporting-title"
                title="Quarterly reporting"
                description="Each subcontractor must receive a report every three months."
              />
              <ul className="list-disc space-y-1 px-4 pl-8 pt-3 text-[12.5px] text-muted-foreground marker:text-border md:pl-9">
                <li>Amount retained and the contract it relates to</li>
                <li>Dates retained and the running total</li>
                <li>Trust account details</li>
                <li>Notice of the subcontractor&apos;s right to inspect</li>
              </ul>
              <div className="mt-4 px-4 md:px-5">
                <Button className="w-full">Generate {report.subcontractors} reports</Button>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                  Period ending {formatDateLong(report.quarterEnd)}.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
