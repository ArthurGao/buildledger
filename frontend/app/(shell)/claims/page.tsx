import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
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
import type { ClaimStatus, ProgressClaim } from "@/lib/types";

const statusTone: Record<ClaimStatus, "secondary" | "warn" | "ok" | "over" | "default"> = {
  Draft: "secondary",
  Served: "default",
  Scheduled: "warn",
  Paid: "ok",
  Disputed: "over",
};

/** The sheet's margins on the first and last cells of every row. */
const first = "pl-4 md:pl-5";
const last = "pr-4 md:pr-5";
/** Below md a claim shows code, description and this claim; the working columns join from md. */
const wide = "hidden md:table-cell";

/**
 * One claim as a section of the sheet. Type follows the ledger roles: the claim
 * is a 15px title on an ink rule, lines are 13px body, subtotals 500 and the net
 * claimed 600 over the double rule, so the head outranks every row beneath it.
 */
function ClaimSection({ claim }: { claim: ProgressClaim }) {
  const clock = getClockForSource(claim.id);
  const contract = getContract(claim.contractId);
  const shortPaid =
    claim.scheduledAmount !== undefined && claim.scheduledAmount < claim.netClaimed;
  const titleId = `claim-${claim.id}`;

  return (
    <section aria-labelledby={titleId} className="claim">
      <SectionHead
        id={titleId}
        title={`Claim ${claim.claimNumber} · ${getProjectName(claim.projectId)}`}
        description={
          <>
            {contract?.counterparty} · period ending {formatDateLong(claim.periodEnd)}
            {claim.servedOn ? ` · served ${formatDateLong(claim.servedOn)}` : " · not yet served"}
          </>
        }
        aside={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant={statusTone[claim.status]}>{claim.status}</Badge>
            {clock ? <ClockBadge clock={clock} /> : null}
          </span>
        }
      />

      {/* From lg every claim shares one set of columns on the sheet's 12 lines:
          code and description 1-5 · contract value 6-7 · complete 8 ·
          previously claimed 9-10 · this claim 11-12. */}
      <Table className="text-[13px] lg:table-fixed">
        <colgroup>
          <col className="w-20 lg:w-[5.5rem]" />
          <col />
          <col className="hidden md:table-column lg:w-[16.6667%]" />
          <col className="hidden md:table-column lg:w-[8.3333%]" />
          <col className="hidden md:table-column lg:w-[16.6667%]" />
          <col className="lg:w-[16.6667%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={first}>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className={`${wide} text-right`}>
              <span className="inline-flex items-center gap-1.5">
                Contract value <SourceBadge system="CostX" short />
              </span>
            </TableHead>
            <TableHead className={`${wide} text-right`}>Complete</TableHead>
            <TableHead className={`${wide} text-right`}>Previously claimed</TableHead>
            <TableHead className={`whitespace-nowrap text-right ${last}`}>This claim</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claim.lines.map((l) => (
            <TableRow key={l.costCode}>
              <TableCell className={`whitespace-nowrap font-mono text-[11.5px] text-muted-foreground ${first}`}>
                {l.costCode}
              </TableCell>
              <TableCell className="font-medium">{l.description}</TableCell>
              <TableCell className={`${wide} tabular text-right`}>{formatCurrency(l.contractValue)}</TableCell>
              <TableCell className={`${wide} tabular text-right text-muted-foreground`}>
                {formatPct(l.percentComplete, 0)}
              </TableCell>
              <TableCell className={`${wide} tabular text-right text-muted-foreground`}>
                {formatCurrency(l.previouslyClaimed)}
              </TableCell>
              <TableCell className={`tabular text-right font-medium ${last}`}>{formatCurrency(l.thisClaim)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="font-normal">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2} className={`font-medium ${first}`}>
              Gross claimed
            </TableCell>
            <TableCell colSpan={3} className={wide} />
            <TableCell className={`tabular text-right font-medium ${last}`}>
              {formatCurrency(claim.grossClaimed)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2} className={`text-muted-foreground ${first}`}>
              Less retention at {formatPct(contract?.retentionPct ?? 0, 0)}
            </TableCell>
            <TableCell colSpan={3} className={wide} />
            <TableCell className={`tabular text-right text-muted-foreground ${last}`}>
              −{formatCurrency(claim.retentionWithheld)}
            </TableCell>
          </TableRow>
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableCell colSpan={2} className={`font-semibold ${first}`}>
              Net claimed
            </TableCell>
            <TableCell colSpan={3} className={wide} />
            <TableCell className={`tabular text-right font-semibold ${last}`}>
              {formatCurrency(claim.netClaimed)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {/* The accountant's double rule under the total. */}
      <div aria-hidden="true" className="h-[5px] border-y border-foreground" />

      {shortPaid ? (
        <div className="mx-4 my-4 rounded-[3px] border border-warn-border bg-warn-soft/60 p-3 md:mx-5">
          <p className="text-[13px] font-medium text-warn">
            Scheduled at {formatCurrency(claim.scheduledAmount ?? 0)} — {" "}
            {formatCurrency(claim.netClaimed - (claim.scheduledAmount ?? 0))} less than claimed
          </p>
          <p className="mt-1 max-w-[72ch] text-[12.5px] leading-snug text-muted-foreground">
            A payment schedule that reduces the amount must state how it was calculated and why it
            differs. Review the reasons before the payment date.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default function ClaimsPage() {
  const claims = getProgressClaims();
  const totals = getClaimTotals();

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Progress claims"
        description="Claims to principals, built from the same cost code breakdown as the budget reconciliation. Retention is withheld here and tracked on the Retentions page."
        action={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="CostX" />
            <SourceBadge system="Xero" />
          </div>
        }
      />

      {/* A claim closes on its double rule, so the next claim and the footnote add no hairline. */}
      <div className="divide-y divide-border border border-border bg-card [&>.claim+.claim]:border-t-0 [&>.claim+.foot]:border-t-0">
        {/* Four ruled figures at the Figure role, below the page title rather than above it. */}
        <section
          aria-label="Claim figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure
            label="Outstanding"
            value={formatCompactCurrency(totals.outstandingValue)}
            source="Xero"
            note={`${totals.outstandingCount} claims awaiting payment`}
          />
          <RuledFigure
            label="In draft"
            value={formatCompactCurrency(totals.draftValue)}
            source="CostX"
            note="not yet served"
          />
          <RuledFigure
            label="Retention withheld"
            value={formatCompactCurrency(totals.retentionThisRound)}
            source="Xero"
            note="across all claims shown"
          />
          <RuledFigure label="Claims this period" value={String(claims.length)} source="CostX" note="across 4 projects" />
        </section>

        {claims.map((c) => (
          <ClaimSection key={c.id} claim={c} />
        ))}

        {/* Said once for every claim, not under each. */}
        <p className="foot px-4 py-3 text-[11.5px] text-muted-foreground md:px-5">
          Line values come from the CostX schedule of values — the same data as the budget
          reconciliation. Percentage complete is certified by the project team, not calculated.
        </p>
      </div>
    </div>
  );
}
